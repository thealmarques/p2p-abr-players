/* eslint-disable no-restricted-globals */
import { getGeoLocation } from "./geo-location";
import { RpcRouterType } from "./interfaces/rpc";
import { RpcWorker } from "./rpc";

export const LOCAL_CONTRACT = {
    getGeoLocation,
}

export type WorkerContract = typeof LOCAL_CONTRACT;

export function expose() {
    new RpcWorker(RpcRouterType.WORKER, self as any, LOCAL_CONTRACT);
}

// Start rpc object in workers side to start listening for messages.
expose();