import { WorkerConfig } from './config.type';
export declare enum PostMessageType {
    INIT_WORKER = "INIT_WORKER",
    DATA_AVAILABLE = "DATA_AVAILABLE",
    START_RECORDING = "START_RECORDING",
    STOP_RECORDING = "STOP_RECORDING",
    ERROR = "ERROR",
    BLOB_READY = "BLOB_READY",
    WORKER_RECORDING = "WORKER_RECORDING",
    WORKER_READY = "WORKER_READY"
}
export declare const initMessage: (wasmURL: string) => {
    type: PostMessageType.INIT_WORKER;
    wasmURL: string;
};
export declare const errorMessage: (error: string) => {
    type: PostMessageType.ERROR;
    error: string;
};
export declare const startRecordingMessage: (config: WorkerConfig) => {
    type: PostMessageType.START_RECORDING;
    config: WorkerConfig;
};
export declare const workerRecordingMessage: () => {
    type: PostMessageType.WORKER_RECORDING;
};
export declare const workerReadyMessage: () => {
    type: PostMessageType.WORKER_READY;
};
export declare const dataAvailableMessage: (data: ArrayLike<number>) => {
    type: PostMessageType.DATA_AVAILABLE;
    data: ArrayLike<number>;
};
export declare const blobReadyMessage: (blob: Blob) => {
    type: PostMessageType.BLOB_READY;
    blob: Blob;
};
export declare const stopRecordingMessage: () => {
    type: PostMessageType.STOP_RECORDING;
};
export declare type WorkerPostMessage = ReturnType<typeof initMessage | typeof errorMessage | typeof startRecordingMessage | typeof dataAvailableMessage | typeof blobReadyMessage | typeof stopRecordingMessage | typeof workerRecordingMessage | typeof workerReadyMessage>;
