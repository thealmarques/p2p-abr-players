import { MapCoordinates } from "./browser";

export type ExposedMethod = (...args: any[]) => Promise<unknown>;

export interface RpcContract {
    [method: string]: ExposedMethod;
}

export type PromiseResponse<T> = (value: T) => void;

export enum RpcRouterType {
    UI,
    WORKER,
}

export enum RpcMessageType {
    BOOT,
    READY,
    REQUEST,
    RESPONSE,
};

export interface RpcMessage {
    type: RpcMessageType;
}

export interface MessageReady extends RpcMessage {
    methods: string[];
}

export interface MessageRequest extends RpcMessage {
    handler: string;
    params: any[];
}

export interface MessageResponse extends RpcMessage {
    data: unknown;
    handler: string;
}

export interface BootConfig {
    browserId: string;
}

export interface BootMessage extends RpcMessage {
    config: BootConfig;
    assetId: string;
    coordinates: MapCoordinates;
}