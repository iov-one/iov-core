#!/usr/bin/env python3
#pylint:disable=missing-docstring,invalid-name

import asyncio
import websockets
import sys

HOST = "localhost"
PORT = 4444

def log(data):
    print(data, flush=True)

@asyncio.coroutine
def connection_handler(connection, path):
    connection_id = hex(id(connection))
    log("{} opened connection via {}".format(connection_id, path))
    try:
        while True:
            incoming_message = yield from connection.recv()
            log("< {}".format(incoming_message))
            outgoing_message = incoming_message
            yield from connection.send(outgoing_message)
            log("> {}".format(outgoing_message))
    except websockets.exceptions.ConnectionClosed:
        log("{} closed connection".format(connection_id))

if __name__ == "__main__":
    log("Starting server at {}:{}".format(HOST, PORT))
    server = websockets.serve(connection_handler, HOST, PORT)
    log("Running now.")

    asyncio.get_event_loop().run_until_complete(server)
    asyncio.get_event_loop().run_forever()
