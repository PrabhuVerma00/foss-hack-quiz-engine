const { ChatManager } = require('../core/chatManager');
const { Server } = require('socket.io');
const { createServer } = require('http');

describe('ChatManager', () => {
  let httpServer, io, chat;
  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      // create chat manager in RESTRICTED mode for pre-canned tests
      chat = new ChatManager(io, { tokenRefillMs: 100, tokenCap: 1, mode: 'RESTRICTED' });
      done();
    });
  });

  afterAll((done) => {
    chat.stop();
    io.close();
    httpServer.close(done);
  });

  test('pre-canned validation accepts allowed id and rejects bad id', () => {
    const allowedId = chat.allowed[0].id;
    const socket = { id: 's1', playerName: 'A' };
    let ack;
    chat.handlePreCanned(socket, { roomPin: 'p1', id: allowedId }, (r) => { ack = r; });
    expect(ack.ok).toBe(true);
    chat.handlePreCanned(socket, { roomPin: 'p1', id: 'bad' }, (r) => { ack = r; });
    expect(ack.ok).toBe(false);
  });

  test('rate limiter blocks fast messages', () => {
    const socket = { id: 's2', playerName: 'B' };
    let ack;
    chat.handleFreeMessage(socket, { roomPin: 'p1', text: 'hello' }, (r) => { ack = r; });
    expect(ack.ok).toBe(true);
    chat.handleFreeMessage(socket, { roomPin: 'p1', text: 'hello again' }, (r) => { ack = r; });
    expect(ack.ok).toBe(false);
  });
});
