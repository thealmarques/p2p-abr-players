import { RpcWorker } from "./rpc"
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!./worker";
import { RpcMessageType, RpcRouterType } from "./interfaces/rpc";
import { WorkerContract } from "./worker";

let worker: Worker = new Worker();
export let remote: WorkerContract;

export function startWorker() {
    startThreadCommunication().then((contract: WorkerContract) => {
        remote = contract;

        remote.getGeoLocation().then((data) => {
            console.log(data);
        });
    });
}

function startThreadCommunication(): Promise<WorkerContract> {
    // We don't need to expose any methods from the UI to the web workers.
    const EXPOSED_METHODS_TO_WORKER = {};

    return new Promise((resolve) => {
        const rpc = new RpcWorker<WorkerContract>(RpcRouterType.UI, worker, EXPOSED_METHODS_TO_WORKER, resolve);
        rpc.sendBootRequest({
            type: RpcMessageType.BOOT,
        });
    });
}
