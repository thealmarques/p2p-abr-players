/* eslint-disable no-restricted-globals */
import { RpcRouterType } from "./interfaces/rpc";
import { LOCAL_CONTRACT, onUIContractReady } from "./lifecycle";
import { RpcWorker } from "./rpc";

export function expose() {
    new RpcWorker(RpcRouterType.WORKER, self as any, LOCAL_CONTRACT, onUIContractReady);
}

// Start rpc object in workers side to start listening for messages.
expose();