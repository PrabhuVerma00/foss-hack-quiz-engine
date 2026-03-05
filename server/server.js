const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Load deck from data/decks/movie.json (relative to repo root)
const deckPath = path.join(__dirname, '..', 'data', 'decks', 'movie.json');
const deck = JSON.parse(fs.readFileSync(deckPath, 'utf-8'));
const QUESTIONS = deck.questions; // array of question objects

// In-memory room store
// Shape: { [pin]: { roomName, hostId, players: [{id, name, score}], status,
//                   currentQ, answersIn: {socketId: answer} } }
const rooms = {};

function generatePIN() {
  let pin;
  do { pin = Math.floor(1000 + Math.random() * 9000).toString(); } while (rooms[pin]);
  return pin;
}

// Strip the answer before sending a question to players
function sanitizeQuestion(q) {
  const { correct_answer, fuzzy_allowances, ...safe } = q;
  return safe;
}

io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // Host creates a room
  socket.on('create_room', ({ roomName }, callback) => {
    const pin = generatePIN();
    rooms[pin] = { roomName, hostId: socket.id, players: [], status: 'lobby', currentQ: -1, answersIn: {} };
    socket.join(pin);
    console.log(`[Room] "${roomName}" created — PIN: ${pin}`);
    callback({ success: true, pin });
  });

  // Player joins a room by PIN
  socket.on('join_room', ({ playerName, pin }, callback) => {
    const room = rooms[pin];
    if (!room) return callback({ success: false, error: 'Room not found. Check your PIN.' });

    const alreadyJoined = room.players.some((p) => p.id === socket.id);
    if (!alreadyJoined) {
      room.players.push({ id: socket.id, name: playerName, score: 0 });
    }
    socket.join(pin);
    console.log(`[Join] "${playerName}" → PIN ${pin}`);
    io.to(pin).emit('player_joined', { players: room.players });
    callback({ success: true, roomName: room.roomName });
  });

  // Host starts the game — sends first question
  socket.on('start_game', ({ pin }, callback) => {
    const room = rooms[pin];
    if (!room) return callback({ success: false, error: 'Room not found.' });
    if (room.hostId !== socket.id) return callback({ success: false, error: 'Only the host can start.' });
    if (room.players.length === 0) return callback({ success: false, error: 'Need at least one player.' });

    room.status = 'started';
    room.currentQ = 0;
    room.answersIn = {};
    console.log(`[Game] PIN ${pin} started with ${room.players.length} player(s).`);

    const q = QUESTIONS[0];
    io.to(pin).emit('game_started', { pin, roomName: room.roomName });
    io.to(pin).emit('next_question', {
      question: sanitizeQuestion(q),
      index: 0,
      total: QUESTIONS.length,
    });

    callback({ success: true });
  });

  // Player submits an answer
  socket.on('submit_answer', ({ pin, answer }, callback) => {
    const room = rooms[pin];
    if (!room || room.status !== 'started') return callback?.({ success: false });

    const qIndex = room.currentQ;
    const q = QUESTIONS[qIndex];

    // Only count first answer per player per question
    if (room.answersIn[socket.id] !== undefined) return callback?.({ success: false, error: 'Already answered.' });

    const correct = answer === q.correct_answer;
    if (correct) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) player.score += 100;
    }

    room.answersIn[socket.id] = answer;
    console.log(`[Answer] PIN ${pin} Q${qIndex} — ${answer} (${correct ? 'correct' : 'wrong'})`);

    // Tell the answering player immediately if they were right
    callback?.({ success: true, correct });

    // Tell the host how many have answered
    io.to(room.hostId).emit('answer_count', {
      count: Object.keys(room.answersIn).length,
      total: room.players.length,
    });
  });

  // Host advances to next question (or ends game)
  socket.on('next_question', ({ pin }, callback) => {
    const room = rooms[pin];
    if (!room) return callback?.({ success: false });
    if (room.hostId !== socket.id) return callback?.({ success: false });

    // Send correct answer + current scores to everyone before moving on
    const prevQ = QUESTIONS[room.currentQ];
    io.to(pin).emit('question_result', {
      correct_answer: prevQ.correct_answer,
      scores: room.players.map((p) => ({ name: p.name, score: p.score })),
    });

    room.currentQ += 1;
    room.answersIn = {};

    if (room.currentQ >= QUESTIONS.length) {
      // Game over
      room.status = 'finished';
      const sorted = [...room.players].sort((a, b) => b.score - a.score);
      io.to(pin).emit('game_over', {
        scores: sorted.map((p) => ({ name: p.name, score: p.score })),
      });
      return callback?.({ success: true, done: true });
    }

    const q = QUESTIONS[room.currentQ];
    io.to(pin).emit('next_question', {
      question: sanitizeQuestion(q),
      index: room.currentQ,
      total: QUESTIONS.length,
    });

    callback?.({ success: true, done: false });
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    console.log(`[-] Disconnected: ${socket.id}`);
    for (const pin in rooms) {
      const room = rooms[pin];
      if (room.hostId === socket.id) {
        io.to(pin).emit('room_closed', { message: 'Host disconnected.' });
        delete rooms[pin];
        console.log(`[Room] PIN ${pin} destroyed.`);
        break;
      }
      const before = room.players.length;
      room.players = room.players.filter((p) => p.id !== socket.id);
      if (room.players.length < before) {
        io.to(pin).emit('player_joined', { players: room.players });
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`LocalFlux server → http://localhost:${PORT}`);
  console.log(`On your network  → http://<your-local-ip>:${PORT}`);
});
