export enum DataChannelState {
    OPEN = 'open',
    CLOSED = 'closed',
}

export enum DataChannelMessageType {
    REQUEST_STREAM,
    STREAM_START,
    STREAM_END,
}

export interface DataChannelData {
    type: DataChannelMessageType;
    from: string;
}

export interface DataChannelRequestData extends DataChannelData {
    type: DataChannelMessageType.REQUEST_STREAM;
    uri: string;
}

export interface DataChannelStreamStartData extends DataChannelData {
    type: DataChannelMessageType.STREAM_START;
    uri: string;
}

export interface DataChannelStreamEndData extends DataChannelData {
    type: DataChannelMessageType.STREAM_END;
}