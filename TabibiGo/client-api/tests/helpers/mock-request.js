const { Readable } = require("node:stream");
const http = require("node:http");

const createMockReqRes = (app, { method = "GET", url = "/", headers = {}, body = null }) => {
  return new Promise((resolve, reject) => {
    const payload = body !== null && body !== undefined ? JSON.stringify(body) : null;
    const req = new Readable({
      read() {
        if (payload) {
          this.push(payload);
        }
        this.push(null);
      },
    });

    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.headers = {
      host: "localhost",
      ...(payload
        ? {
            "content-type": "application/json",
            "content-length": Buffer.byteLength(payload).toString(),
          }
        : {}),
      ...headers,
    };

    const mockSocket = {
      remoteAddress: "127.0.0.1",
      encrypted: false,
      destroy: () => {},
      end: () => {},
      write: () => true,
      on: () => mockSocket,
      once: () => mockSocket,
      emit: () => false,
    };

    req.connection = mockSocket;
    req.socket = mockSocket;

    const res = new http.ServerResponse(req);
    let responseBody = "";

    const originalWrite = res.write;
    res.write = function (chunk, ...args) {
      if (chunk) responseBody += chunk.toString();
      return originalWrite.apply(this, [chunk, ...args]);
    };

    const originalEnd = res.end;
    res.end = function (chunk, ...args) {
      if (chunk) responseBody += chunk.toString();
      originalEnd.apply(this, [chunk, ...args]);
      let parsed = responseBody;
      try {
        parsed = JSON.parse(responseBody);
      } catch {}
      resolve({ statusCode: res.statusCode, body: parsed });
    };

    try {
      app.handle(req, res);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { createMockReqRes };
