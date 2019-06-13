import { exec } from "child_process";

import { ReconnectingSocket } from "./reconnectingsocket";

function pendingWithoutSocketServer(): void {
  if (!process.env.SOCKETSERVER_ENABLED) {
    pending("Set SOCKETSERVER_ENABLED to enable socket tests");
  }
}

describe("ReconnectingSocket", () => {
  const socketServerUrl = "ws://localhost:4444/websocket";

  it("can be constructed", () => {
    const socket = new ReconnectingSocket(socketServerUrl);
    expect(socket).toBeTruthy();
  });

  describe("connect", () => {
    it("cannot connect after being connected", done => {
      pendingWithoutSocketServer();
      const socket = new ReconnectingSocket(socketServerUrl);
      // Necessary otherwise the producer doesn’t start
      socket.events.subscribe({});

      socket.connect();

      setTimeout(() => {
        expect(() => socket.connect()).toThrowError(/cannot connect/i);
        done();
      }, 1000);
    });
  });

  describe("disconnect", () => {
    it("ends the events stream", done => {
      pendingWithoutSocketServer();
      const socket = new ReconnectingSocket(socketServerUrl);
      socket.events.subscribe({
        complete: done,
      });

      socket.connect();

      setTimeout(() => socket.disconnect(), 1000);
    });

    it("cannot connect after being disconnected", done => {
      pendingWithoutSocketServer();
      const socket = new ReconnectingSocket(socketServerUrl);
      // Necessary otherwise the producer doesn’t start
      socket.events.subscribe({});

      socket.connect();

      setTimeout(() => {
        socket.disconnect();
        expect(() => socket.connect()).toThrowError(/cannot connect/i);
        done();
      }, 1000);
    });
  });

  describe("reconnection", () => {
    const dirPath = "../../scripts/socketserver/";
    const PKILL_NO_PROCESSES_MATCHED = 1;
    const startServer = `${dirPath}start.sh`;
    const stopServer = `${dirPath}stop.sh`;

    it("automatically reconnects if no connection can be established at init", done => {
      pendingWithoutSocketServer();

      exec(stopServer, stopError => {
        if (stopError && stopError.code !== PKILL_NO_PROCESSES_MATCHED) {
          done.fail(stopError);
        }

        const socket = new ReconnectingSocket(socketServerUrl);
        const requests = ["request 1", "request 2", "request 3"] as const;
        let eventsSeen = 0;
        socket.events.subscribe({
          next: ({ data }) => {
            expect(data).toEqual(requests[eventsSeen++]);
            if (eventsSeen === requests.length) {
              socket.disconnect();
            }
          },
          complete: () => {
            // Make sure we don't get a completion unexpectedly
            if (eventsSeen === requests.length) {
              done();
            }
          },
        });

        socket.connect();
        requests.forEach(request => socket.queueRequest(request));

        setTimeout(
          () =>
            exec(startServer, startError => {
              if (startError) {
                done.fail(startError);
              }
            }),
          2000,
        );
      });
    });

    it("automatically reconnects if the connection is broken off", done => {
      pendingWithoutSocketServer();

      const socket = new ReconnectingSocket(socketServerUrl);
      const requests = ["request 1", "request 2", "request 3"] as const;
      let eventsSeen = 0;
      socket.events.subscribe({
        next: ({ data }) => {
          expect(data).toEqual(requests[eventsSeen++]);
          if (eventsSeen === requests.length) {
            socket.disconnect();
          }
        },
        complete: () => {
          // Make sure we don't get a completion unexpectedly
          if (eventsSeen === requests.length) {
            done();
          }
        },
      });

      socket.connect();
      socket.queueRequest(requests[0]);

      setTimeout(
        () =>
          exec(stopServer, stopError => {
            if (stopError && stopError.code !== PKILL_NO_PROCESSES_MATCHED) {
              done.fail(stopError);
            }

            requests.slice(1).forEach(request => socket.queueRequest(request));

            setTimeout(
              () =>
                exec(startServer, startError => {
                  if (startError) {
                    done.fail(startError);
                  }
                }),
              2000,
            );
          }),
        1000,
      );
    });
  });
});
