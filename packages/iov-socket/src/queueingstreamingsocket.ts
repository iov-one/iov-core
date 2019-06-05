// tslint:disable:readonly-array readonly-keyword
import { StreamingSocket } from "./streamingsocket";

/**
 * A StreamingSocket that can queue requests.
 */
export class QueueingStreamingSocket extends StreamingSocket {
  private queue: string[] = [];

  public getQueueLength(): number {
    return this.queue.length;
  }

  public async queueRequest(data: string): Promise<void> {
    this.queue.push(data);
    return this.processQueue();
  }

  public async processQueue(): Promise<void> {
    let data: string | undefined = this.queue.shift();
    while (data) {
      try {
        await this.send(data);
      } catch (error) {
        // Assume that the connection is down; stop processing queue for now.
        this.queue.unshift(data);
        break;
      }
      data = this.queue.shift();
    }
  }
}
