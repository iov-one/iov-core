import { Stream } from "xstream";
import { ValueAndUpdates } from "@iov/stream";
import { ConnectionStatus } from "./queueingstreamingsocket";
import { SocketWrapperMessageEvent } from "./socketwrapper";
/**
 * A wrapper around QueueingStreamingSocket that reconnects automatically.
 */
export declare class ReconnectingSocket {
    readonly connectionStatus: ValueAndUpdates<ConnectionStatus>;
    readonly events: Stream<SocketWrapperMessageEvent>;
    private readonly socket;
    private eventProducerListener;
    private unconnected;
    private timeoutIndex;
    private reconnectTimeout;
    constructor(url: string, timeout?: number, reconnectedHandler?: () => void);
    connect(): void;
    disconnect(): void;
    queueRequest(request: string): void;
}
