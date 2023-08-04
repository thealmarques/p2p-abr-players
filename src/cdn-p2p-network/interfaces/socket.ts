import { PeerDetail } from "./peer";

export enum SocketMessageType {
    BOOT = 'BOOT',
    DISCOVERY = 'DISCOVERY',
    DATA = 'DATA',
    EXIT = 'EXIT',
    OFFER = 'OFFER',
    ANSWER = 'ANSWER',
    CANDIDATE = 'CANDIDATE',
    DISCONNECT = 'DISCONNECT',
}

export interface SocketMessage {
    assetId: string,
}

export interface SocketBootMessage extends SocketMessage {
    data: PeerDetail;
}

export interface SocketDataMessage extends SocketMessage {
    data: PeerDetail;
    uri: string;
    to?: string;
}

export interface SocketOfferMessage extends SocketMessage {
    offer: string;
    to: string;
    from: string;
}

export interface SocketAnswerMessage extends SocketMessage {
    answer: string;
    to: string;
    from: string;
}

export interface SocketCandidateMessage extends SocketMessage {
    to: string;
    candidate: string;
    from: string;
}

export interface SocketDisconnectMessage extends SocketMessage {
    from: string;
    assetId: string;
}