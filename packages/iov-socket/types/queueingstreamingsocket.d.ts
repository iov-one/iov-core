import { Stream } from "xstream";
import { SocketWrapperMessageEvent } from "./socketwrapper";
/**
 * A wrapper around StreamingSocket that can queue requests.
 */
export declare class QueueingStreamingSocket {
    readonly connected: Promise<void>;
    readonly events: Stream<SocketWrapperMessageEvent>;
    private errorProducerListener;
    private readonly socket;
    private readonly queue;
    private isProcessingQueue;
    private timeoutIndex;
    private processQueueTimeout;
    constructor(url: string, timeout?: number);
    connect(): void;
    disconnect(): void;
    getQueueLength(): number;
    queueRequest(request: string): void;
    private processQueue;
}
