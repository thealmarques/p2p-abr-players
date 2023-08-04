import { STUN_SERVERS } from "../../constants/stun-list";
import {
  DataChannelMessageType,
  DataChannelRequestData,
  DataChannelState,
} from "../../interfaces/web-rtc";
import { remote } from "../workers";
import { PromiseResponse } from "../workers/interfaces/rpc";
import {
  DataChannelMessage,
  isDataMessage,
} from "./message-serializer/data-channel";
import { concatArrayBuffers } from "./utils";

const MAX_CHUNK_SIZE = 1000 * 15;

export class P2PAdapter {
  private static peerConnection: RTCPeerConnection;
  private static remoteConnections: Record<string, RTCPeerConnection> = {};
  private static dataChannels: Record<string, RTCDataChannel> = {};
  private static bufferResolver: Array<PromiseResponse<unknown>> = [];
  private static transferableBuffer: ArrayBuffer[] = [];
  private static id: string;

  public static initialize(id: string) {
    this.id = id;

    // Create local WebRTC Peer connection
    // TODO: check stun servers connectivity status.
    this.peerConnection = new RTCPeerConnection(STUN_SERVERS);
  }

  public static createAnswer(offer: string, from: string) {
    this.remoteConnections[from] = new RTCPeerConnection(STUN_SERVERS);
    this.remoteConnections[from].ondatachannel = (
      event: RTCDataChannelEvent
    ) => {
      const { channel } = event;
      this.dataChannels[from] = channel;
      channel.addEventListener("message", this.handleMessage.bind(this));
      channel.addEventListener("error", (error) => {
        console.warn(error);
        this.dataChannels[from].close();
        this.remoteConnections[from].close();
      });
    };

    return this.remoteConnections[from]
      .setRemoteDescription(JSON.parse(offer))
      .then(() => this.remoteConnections[from].createAnswer())
      .then((answer) => {
        this.remoteConnections[from].setLocalDescription(answer);
        this.remoteConnections[from].onicecandidate = (
          event: RTCPeerConnectionIceEvent
        ) => {
          if (event.candidate) {
            remote.sendIceCandidate(from, JSON.stringify(event.candidate));
          }
        };

        return JSON.stringify(answer);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public static addIceCandidate(candidate: string, from: string) {
    return new Promise((resolve) => {
      if (this.remoteConnections[from]) {
        resolve(
          this.remoteConnections[from].addIceCandidate(JSON.parse(candidate))
        );
      } else {
        resolve(this.peerConnection.addIceCandidate(JSON.parse(candidate)));
      }
    });
  }

  private static async requestSegment(uri: string, id: string) {
    return new Promise((resolve) => {
      this.bufferResolver.push(resolve);
      this.dataChannels[id]?.send(
        JSON.stringify(
          new DataChannelMessage({
            type: DataChannelMessageType.REQUEST_STREAM,
            uri,
            from: this.id,
          })
        )
      );
    });
  }

  private static async sendDataStream(data: DataChannelRequestData) {
    const channel = this.dataChannels[data.from];
    if (channel.readyState !== DataChannelState.OPEN) {
      console.warn("Data channel is not open.");
      this.establishDataChannel(data.from);
      return;
    }

    console.log(channel);
    let buffer = (await remote.getAssetData(data.uri)) as ArrayBuffer;
    console.log(buffer);
    if (!buffer) {
      // If undefined then send message to resolve the promise in the peer.
      channel.send(
        JSON.stringify(
          new DataChannelMessage({
            type: DataChannelMessageType.STREAM_END,
            from: this.id,
          })
        )
      );
      return;
    }

    // Start stream event.
    channel.send(
      JSON.stringify(
        new DataChannelMessage({
          type: DataChannelMessageType.STREAM_START,
          uri: data.uri,
          from: data.from,
        })
      )
    );

    for (let i = 0; i < buffer.byteLength; i += MAX_CHUNK_SIZE) {
      const slice = buffer.slice(i, i + MAX_CHUNK_SIZE);
      channel.send(slice);
    }

    channel.send(
      JSON.stringify(
        new DataChannelMessage({
          type: DataChannelMessageType.STREAM_END,
          from: this.id,
        })
      )
    );
  }

  private static handleMessage(event: MessageEvent) {
    const message =
      typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    console.log(message);
    if (isDataMessage(message)) {
      if (message.data.type === DataChannelMessageType.REQUEST_STREAM) {
        // Someone asked for a segment.
        this.sendDataStream(message.data);
      } else if (message.data.type === DataChannelMessageType.STREAM_START) {
        // Started receiving a segment.
        this.transferableBuffer = [];
      } else if (
        this.transferableBuffer &&
        message.data.type === DataChannelMessageType.STREAM_END
      ) {
        // Received last segment.
        const buffer = concatArrayBuffers(this.transferableBuffer);
        this.bufferResolver[0]?.(buffer);
        this.bufferResolver.shift();
        remote.onDataChannelMessage(message.data.from, buffer.byteLength);
      }
    } else {
      // Chunk item received.
      this.transferableBuffer.push(event.data);
    }
  }

  public static async establishDataChannel(id: string): Promise<any> {
    const channel = this.peerConnection.createDataChannel("sendchannel", {
      ordered: true,
      id: Math.floor(Math.random() * 10),
    });
    channel.binaryType = "arraybuffer";
    channel.addEventListener("message", this.handleMessage.bind(this));
    this.dataChannels[id] = channel;

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    const answer = await remote.getRemoteAnswer(id, JSON.stringify(offer));
    if (answer) {
      await this.peerConnection.setRemoteDescription(JSON.parse(answer));
      this.peerConnection.onicecandidate = (
        event: RTCPeerConnectionIceEvent
      ) => {
        if (event.candidate) {
          remote.sendIceCandidate(id, JSON.stringify(event.candidate));
        }
      };

      return true;
    }

    return new Promise((resolve) => {
      this.dataChannels[id].addEventListener("open", () => {
        return resolve(true);
      });

      this.dataChannels[id].addEventListener("error", () => {
        console.error("Error establishing data channel");
        return resolve(false);
      });
    });
  }

  public static async getPeerSegment(uri: string) {
    const detail = await remote.availablePeer(uri);
    if (detail && !this.dataChannels[detail.id]) {
      await this.establishDataChannel(detail.id);
      return;
    }

    console.log(this.dataChannels);

    if (
      detail &&
      this.dataChannels[detail.id].readyState === DataChannelState.CLOSED
    ) {
      return;
    }

    console.log(this.dataChannels);

    if (
      detail &&
      this.dataChannels[detail.id]?.readyState === DataChannelState.OPEN
    ) {
      console.log("requesting segment from peer", detail?.id);

      // Connected to the Peer - we can ask directly for the data.
      const segment = (await this.requestSegment(uri, detail.id)) as
        | ArrayBuffer
        | undefined;
      if (segment && segment.byteLength > 0) {
        return {
          data: segment,
          uri,
          originalUri: uri,
          fromCache: true,
          headers: {},
        };
      }
    }
  }
}
