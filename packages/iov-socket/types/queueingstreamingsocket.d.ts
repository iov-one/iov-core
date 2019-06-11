import { Stream } from "xstream";
import { SocketWrapperMessageEvent } from "./socketwrapper";
/**
 * A wrapper around StreamingSocket that can queue requests.
 */
export declare class QueueingStreamingSocket {
    connected: Promise<void>;
    events: Stream<SocketWrapperMessageEvent>;
    private readonly url;
    private readonly timeout;
    private readonly queue;
    private socket;
    private isProcessingQueue;
    private timeoutIndex;
    private processQueueTimeout;
    constructor(url: string, timeout?: number);
    connect(): void;
    disconnect(): void;
    reconnect(): void;
    getQueueLength(): number;
    queueRequest(request: string): void;
    private processQueue;
}
