import { PeerDetail } from "../../../interfaces/peer";
import { PeerManager } from "../peer-manager";
import { getAssetId } from "./assets";

const SOCKET_URL = "localhost:3035";

let peerManager: PeerManager;

export function createPeerManager(): Promise<void> {
  return new Promise(() => {
    peerManager = new PeerManager(SOCKET_URL, getAssetId());
  });
}

export function getBrowserId(): Promise<string> {
  return new Promise((resolve) => {
    resolve(peerManager.getBrowserId());
  });
}

export function sendIceCandidate(to: string, candidate: string): Promise<void> {
  return new Promise(() => {
    return peerManager.sendIceCandidate(to, candidate);
  });
}

export function getRemoteAnswer(to: string, offer: string): Promise<string> {
  return peerManager.getAnswer(to, offer);
}

export function informPeerNetwork(uri: string): void {
  peerManager.inform(uri);
}

export function availablePeer(uri: string): Promise<PeerDetail | undefined> {
  return new Promise((resolve) => {
    resolve(peerManager.findNearestPeer(uri));
  });
}

export function disconnectPeer(): Promise<void> {
  return new Promise(() => {
    return peerManager.disconnect();
  });
}

export function onPeerConnect(): Promise<void> {
  return new Promise(() => {
    peerManager.registerOnPeerConnect();
  });
}

export function onDataChannelMessage(id: string, byteLength: number) {
  return new Promise(() => {
    peerManager.onDataChannelMessage(id, byteLength);
  });
}
