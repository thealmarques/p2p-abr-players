import { DataChannelRequestData, DataChannelStreamEndData, DataChannelStreamStartData } from "../../../interfaces/web-rtc";

export class DataChannelMessage {
    public data: DataChannelRequestData | DataChannelStreamStartData | DataChannelStreamEndData;

    constructor(data: DataChannelRequestData | DataChannelStreamStartData | DataChannelStreamEndData) {
        this.data = data;
    }
}

export function isDataMessage(obj: DataChannelMessage): obj is DataChannelMessage {
    return 'data' in obj;
}