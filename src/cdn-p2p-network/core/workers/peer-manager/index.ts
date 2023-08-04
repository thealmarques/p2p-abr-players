import { kdTree } from "kd-tree-javascript";
import { io, Socket } from "socket.io-client";
import { PeerDetail } from "../../../interfaces/peer";
import { SocketAnswerMessage, SocketBootMessage, SocketCandidateMessage, SocketDataMessage, SocketDisconnectMessage, SocketMessageType, SocketOfferMessage } from "../../../interfaces/socket";
import { uiRemote } from "../lifecycle";
import { getAllAssetData } from "../state/assets";
import { getBrowserLocation } from "../state/browser";
import distance from "./distance";

export class PeerManager {
    private me: PeerDetail;
    private tree: Record<string, kdTree<PeerDetail>>;
    private socket: Socket;
    private assetid: string;
    private answerQueue: Record<string, (value: string | PromiseLike<string>) => void> = {};
    private onPeerConnect: ((peer: PeerDetail, requestedSegments: number) => void) | undefined;
    private peers: Record<string, PeerDetail> = {};
    private exchangedMessages: Record<string, number> = {};

    constructor(url: string, assetId: string) {
        const socket = (this.socket = io(url, { transports : ['websocket'] }));
        this.tree = {};

        const location = getBrowserLocation();
        this.me = {
            id: location.id,
            lat: location.coordinates.lat,
            lng: location.coordinates.lng,
        };

        this.assetid = assetId;
        const message: SocketBootMessage = {
            assetId,
            data: this.me
        };

        socket.on(SocketMessageType.BOOT, this.onPeerBoot.bind(this));
        socket.on(SocketMessageType.DATA, this.onPeerData.bind(this));
        socket.on(SocketMessageType.OFFER, this.onPeerOffer.bind(this));
        socket.on(SocketMessageType.ANSWER, this.onPeerAnswer.bind(this));
        socket.on(SocketMessageType.CANDIDATE, this.onCandidateReceived.bind(this));
        socket.on(SocketMessageType.DISCONNECT, this.onPeerDisconnect.bind(this));

        socket.emit(SocketMessageType.BOOT, message);
    }

    private async onPeerOffer(event: SocketOfferMessage) {
        if (event.to === this.me.id) {
            const answer = await uiRemote.createAnswer(event.offer, event.from);
            const message: SocketAnswerMessage = {
                answer,
                to: event.from,
                from: this.me.id,
                assetId: this.assetid,
            };
            this.socket.emit(SocketMessageType.ANSWER, message);
        }
    }

    private async onPeerAnswer(event: SocketAnswerMessage) {
        if (event.to === this.me.id) {
            this.answerQueue[event.from]?.(event.answer);
        }
    }

    private onPeerData(event: SocketDataMessage) {
        if (event.to && event.to !== this.me.id) {
            return;
        }

        if (!this.peers[event.data.id]) {
            this.peers[event.data.id] = event.data;
            this.exchangedMessages[event.data.id] = 0;
        }

        if (!this.tree[event.uri]) {
            this.tree[event.uri] = new kdTree([], distance, ['lat', 'lng']);
        }

        this.tree[event.uri].insert(event.data);
    }

      private onPeerDisconnect(event: SocketDisconnectMessage): void {
        console.log('Peer disconnected', event.from);
        const id = event.from;
        delete this.peers[id];
      }

    private onPeerBoot(event: SocketBootMessage) {
        const assetData = getAllAssetData();
        Object.keys(assetData).forEach(uri => {
            this.inform(uri, event.data.id);
        });
    }

    private onCandidateReceived(event: SocketCandidateMessage) {
        if (event.to === this.me.id) {
            uiRemote.addIceCandidate(event.candidate, event.from);
        }
    }

    public registerOnPeerConnect() {
        this.onPeerConnect = uiRemote.onPeerConnect;
    }

    public onDataChannelMessage(id: string, byteLength: number) {
        let requests = this.exchangedMessages[id] + byteLength;
        this.exchangedMessages[id] = requests;
        this.onPeerConnect?.(this.peers[id], requests);
    }

    public findNearestPeer(uri: string) {
        const peer: PeerDetail | undefined = this.tree[uri]?.nearest(this.me, 1)[0][0];

        if (peer && !this.peers[peer.id]) {
          // Peer was disconnected
          const tree = this.tree[uri];
          tree.remove(peer);
        }

        return this.tree[uri]?.nearest(this.me, 1)[0][0];
    }

    public inform(uri: string, to?: string) {
        const message: SocketDataMessage = {
            data: this.me,
            uri,
            assetId: this.assetid,
            to,
        };

        this.socket.emit(SocketMessageType.DATA, message);
    }

    public getAnswer(to: string, offer: string) {
        return new Promise<string>(resolve => {
            this.answerQueue[to] = resolve;
            const message: SocketOfferMessage = {
                offer,
                to,
                from: this.me.id,
                assetId: this.assetid,
            }
            this.socket.emit(SocketMessageType.OFFER, message);
        });
    }

    public sendIceCandidate(to: string, candidate: string) {
        const message: SocketCandidateMessage = {
            to,
            candidate,
            assetId: this.assetid,
            from: this.me.id,
        };
        this.socket.emit(SocketMessageType.CANDIDATE, message);
    }

    public getBrowserId() {
        return this.me.id;
    }

    public disconnect(): void {
        this.socket.emit(SocketMessageType.DISCONNECT, {
          assetId: this.assetid,
          from: this.me.id,
        });
      }
}