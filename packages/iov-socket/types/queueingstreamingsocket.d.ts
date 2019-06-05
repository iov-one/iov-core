import { StreamingSocket } from "./streamingsocket";
/**
 * A StreamingSocket that can queue requests.
 */
export declare class QueueingStreamingSocket extends StreamingSocket {
    private queue;
    getQueueLength(): number;
    queueRequest(data: string): Promise<void>;
    processQueue(): Promise<void>;
}
