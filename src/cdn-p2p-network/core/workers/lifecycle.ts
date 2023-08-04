import { setAssetData, getAssetData } from "./state/assets";
import { createPeerManager, availablePeer, getRemoteAnswer, sendIceCandidate, getBrowserId, onPeerConnect, onDataChannelMessage, disconnectPeer } from './state/peer';
import { getGeoLocation } from "./geo-location";
import { PeerDetail } from "../../interfaces/peer";

export const LOCAL_CONTRACT = {
    getGeoLocation,
    setAssetData,
    createPeerManager,
    availablePeer,
    disconnectPeer,
    getRemoteAnswer,
    getAssetData,
    sendIceCandidate,
    getBrowserId,
    onPeerConnect,
    onDataChannelMessage,
}

export type WorkerContract = typeof LOCAL_CONTRACT;

export let uiRemote: {
    createAnswer: (offer: string, from: string) => Promise<string>;
    addIceCandidate: (candidate: string, from: string) => Promise<string>;
    onPeerConnect: (peer: PeerDetail, size: number) => Promise<void>;
};

export function onUIContractReady(contract: any) {
    uiRemote = contract;
}