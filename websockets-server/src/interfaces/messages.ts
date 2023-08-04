export enum MessageType {
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
    room: string,
}

export interface PeerDetail {
    id: string;
    lat: number;
    lng: number;
}

export interface SocketBootMessage extends SocketMessage{
    data: PeerDetail;
    offer: string;
}

export interface SocketDataMessage extends SocketMessage{
    data: PeerDetail;
    uri: string;
}


export interface SocketOfferMessage extends SocketMessage {
    offer: string;
    to: string;
    from: string;
}

export interface SocketAnswerMessage extends SocketMessage {
    offer: string;
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
}