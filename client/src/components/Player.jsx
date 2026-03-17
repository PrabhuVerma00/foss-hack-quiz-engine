import { useState, useEffect, useRef } from 'react';
import Chat from './Chat';
import { createGameSocket } from '../backendUrl';

const PLAYER_SESSION_KEY = 'lf_player_session_id';
const PLAYER_STATE_KEY = 'lf_player_state';

function getOrCreatePlayerSessionId() {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(PLAYER_SESSION_KEY);
  if (existing) return existing;
  const next =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `ps_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem(PLAYER_SESSION_KEY, next);
  return next;
}

function readPlayerState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PLAYER_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistPlayerState(next) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(next));
}

function clearPlayerState() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PLAYER_STATE_KEY);
}

function getPinFromUrl() {
  if (typeof window === 'undefined') return '';
  const raw = new URLSearchParams(window.location.search).get('pin') || '';
  return raw.replace(/\D/g, '').slice(0, 4);
}

export default function Player({ onBack }) {
  const savedPlayerState = readPlayerState();
  const playerSessionIdRef = useRef(getOrCreatePlayerSessionId());
  const resumeAttemptedRef = useRef(false);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState(savedPlayerState?.name || '');
  const [pin, setPin] = useState(getPinFromUrl() || savedPlayerState?.pin || '');
  const [error, setError] = useState('');
  const [roomName, setRoomName] = useState(savedPlayerState?.roomName || '');

  const [phase, setPhase] = useState(savedPlayerState?.pin ? 'waiting' : 'join');
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [finalScores, setFinalScores] = useState([]);
  const [chatMode, setChatMode] = useState('FREE');
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeTotal, setTimeTotal] = useState(0);
  const [questionEndsAt, setQuestionEndsAt] = useState(0);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const modeLabels = { FREE: 'OPEN', RESTRICTED: 'GUIDED', OFF: 'SILENT' };

  useEffect(() => {
    if (!name.trim() && !pin.trim() && !roomName.trim()) return;
    persistPlayerState({
      name: name.trim(),
      pin: pin.trim(),
      roomName: roomName.trim(),
      updatedAt: Date.now(),
    });
  }, [name, pin, roomName]);

  useEffect(() => {
    const socket = createGameSocket();
    socketRef.current = socket;
    socket.on('connect', () => {
      setConnected(true);

      const saved = readPlayerState();
      if (resumeAttemptedRef.current || !saved?.pin || !saved?.name) return;

      resumeAttemptedRef.current = true;
      socket.emit(
        'player:resume',
        {
          pin: saved.pin,
          playerSessionId: playerSessionIdRef.current,
        },
        (res) => {
          if (!res?.success) {
            setPhase('join');
            setError('Previous player session was not recoverable. Rejoin with PIN.');
            return;
          }

          setError('');
          setPin(saved.pin);
          setName(saved.name);
          setRoomName(res.roomName || saved.roomName || '');
          setMyScore(Number(res.myScore) || 0);

          if (res.status === 'started' && res.activeQuestion) {
            const { question, durationMs, endsAt } = res.activeQuestion;
            setQuestion(question);
            const normalizedMs = Number.isFinite(Number(durationMs)) && Number(durationMs) > 0 ? Number(durationMs) : 20000;
            const targetEndsAt = Number(endsAt) || Date.now() + normalizedMs;
            setTimeTotal(Math.ceil(normalizedMs / 1000));
            setQuestionEndsAt(targetEndsAt);
            setTimeLeft(Math.max(0, Math.ceil((targetEndsAt - Date.now()) / 1000)));

            if (res.alreadyAnswered) {
              setSelected(res.answeredValue || null);
              setPhase('answered');
            } else {
              setSelected(null);
              setPhase('question');
            }
          } else {
            setPhase('waiting');
          }
        }
      );
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('chat:mode', ({ mode }) => setChatMode(mode));
    socket.on('room_closed', ({ message }) => {
      setError(message || 'Room closed by host.');
      setPhase('join');
      setRoomName('');
      clearPlayerState();
    });
    socket.on('game_started', () => setPhase('waiting'));
    socket.on('next_question', ({ question, durationMs, endsAt }) => {
      setQuestion(question);
      setSelected(null);
      setResultData(null);
      setChatDrawerOpen(false);
      const limitMs = Number(durationMs ?? question?.time_limit_ms);
      const normalizedMs = Number.isFinite(limitMs) && limitMs > 0 ? limitMs : 20000;
      const targetEndsAt = Number(endsAt) || Date.now() + normalizedMs;
      setTimeTotal(Math.ceil(normalizedMs / 1000));
      setQuestionEndsAt(targetEndsAt);
      setTimeLeft(Math.max(0, Math.ceil((targetEndsAt - Date.now()) / 1000)));
      setPhase('question');
    });
    socket.on('question_result', (data) => {
      setResultData(data);
      const me = data.scores.find(p => p.id === socket.id);
      if (me) setMyScore(me.score);
      setPhase('result');
    });
    socket.on('game_over', ({ scores }) => {
      setFinalScores(scores);
      setPhase('gameover');
    });
    return () => {
      socket.off('chat:mode');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!(phase === 'question' || phase === 'answered') || !questionEndsAt) return undefined;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((questionEndsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [phase, questionEndsAt]);

  const handleJoin = () => {
    if (!name.trim()) return setError('Enter your name.');
    if (pin.length < 4) return setError('Enter the 4-digit PIN.');
    if (!socketRef.current?.connected) return setError('Not connected.');
    setError('');
    socketRef.current.emit('join_room', { pin, playerName: name.trim(), playerSessionId: playerSessionIdRef.current }, (res) => {
      if (res.success) {
        setRoomName(res.roomName);
        setPhase('waiting');
      }
      else setError(res.error || 'Could not join.');
    });
  };

  const handleBack = () => {
    clearPlayerState();
    onBack?.();
  };

  const handleLeaveRoom = () => {
    const ok = window.confirm('Leave this room and return home?');
    if (!ok) return;
    handleBack();
  };

  const handleAnswer = (opt) => {
    if (selected) return;
    setSelected(opt);
    setChatDrawerOpen(false);
    setPhase('answered');
    socketRef.current.emit('submit_answer', { pin, answer: opt });
  };

  const timerTone =
    timeTotal > 0 && timeLeft <= Math.ceil(timeTotal * 0.25)
      ? 'text-red-400'
      : timeTotal > 0 && timeLeft <= Math.ceil(timeTotal * 0.5)
        ? 'text-amber-300'
        : 'text-emerald-300';

  if (phase === 'gameover') {
    const myEntry = finalScores.find(p => p.id === socketRef.current?.id);
    const myRank = finalScores.findIndex(p => p.id === socketRef.current?.id) + 1;
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col p-5 pt-8 animate-phase-in">
        <p className="mb-5 text-[11px] uppercase tracking-[0.28em] text-slate-500">Game Over</p>
        <h2 className="text-4xl font-black tracking-tight mb-2">Final Standings</h2>
        {myEntry && (
          <p className="text-slate-400 text-sm mb-6 font-mono tabular-nums">
            You placed #{myRank} with {myEntry.score} pts
          </p>
        )}
        <div className="flex flex-col gap-3 flex-1">
          {finalScores.map((p, i) => (
            <div
              key={p.name}
              className={`flex items-center justify-between rounded-2xl px-4 py-4 border ${
                i === 0
                  ? 'border-amber-300/50 bg-amber-300/15 text-amber-100'
                  : p.id === socketRef.current?.id
                    ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100'
                    : 'border-slate-800 bg-slate-900/80 text-white'
              }`}
            >
              <span className="font-mono text-sm w-6 tabular-nums">{i + 1}</span>
              <span className="flex-1 font-semibold">{p.name}</span>
              <span className="font-black tabular-nums">{p.score}</span>
            </div>
          ))}
        </div>
        <button onClick={handleBack} className="w-full mt-8 rounded-2xl border border-slate-700 bg-slate-900 py-4 text-lg font-black text-white transition-all duration-150 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-slate-800 active:translate-y-0 active:scale-95">
          HOME
        </button>
      </div>
    );
  }

  if (phase === 'result' && resultData) {
    const gotIt = selected === resultData.correct_answer;
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 gap-6 text-white animate-phase-in ${gotIt ? 'bg-emerald-950' : 'bg-rose-950'}`}>
        <button onClick={handleLeaveRoom} className="absolute top-5 left-5 rounded-lg border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/85 transition hover:bg-black/45">Leave</button>
        <div className={`text-6xl font-black tracking-tight ${gotIt ? 'text-emerald-300' : 'text-rose-300'}`}>
          {gotIt ? 'CORRECT' : 'INCORRECT'}
        </div>
        <p className="rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-center text-sm text-slate-200">
          Correct answer: <span className="font-black text-white">{resultData.correct_answer}</span>
        </p>
        <p className="font-mono text-sm tabular-nums">Score: <span className="font-black text-amber-300">{myScore}</span></p>
        <p className="text-xs uppercase tracking-[0.24em] text-white/60">Waiting for host</p>
      </div>
    );
  }

  if (phase === 'answered') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 gap-4 animate-phase-in">
        <button onClick={handleLeaveRoom} className="absolute top-5 left-5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-200 transition hover:bg-slate-800">Leave</button>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Answer Locked</p>
        <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-4 text-2xl font-black text-emerald-200 shadow-lg shadow-emerald-900/30">{selected}</p>
        <div className={`mt-2 text-3xl font-black tabular-nums ${timeLeft <= 5 ? 'animate-pulse' : ''} ${timerTone}`}>{timeLeft}s</div>
        <div className="mt-3 flex gap-2">
          <span className="status-dot" />
          <span className="status-dot" />
          <span className="status-dot" />
        </div>
        <p className="text-slate-500 text-sm mt-3">Waiting for others...</p>
      </div>
    );
  }

  if (phase === 'question' && question) {
    const progress = timeTotal > 0 ? Math.max(0, Math.round((timeLeft / timeTotal) * 100)) : 0;
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 pt-6 pb-24 md:pb-6 animate-phase-in">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <button onClick={handleLeaveRoom} className="mb-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-200 transition hover:bg-slate-800">Leave</button>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{roomName}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Timer</p>
            <p className={`text-2xl font-black tabular-nums ${timeLeft <= 5 ? 'animate-pulse' : ''} ${timerTone}`}>{timeLeft}s</p>
          </div>
        </div>

        <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progress <= 25 ? 'bg-red-400' : progress <= 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-6">
          <p className="text-2xl font-black leading-tight">{question.prompt}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 content-start">
          {question.options.map((opt, idx) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className={`w-full rounded-2xl border px-5 py-6 text-left text-xl font-black transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
                idx % 4 === 0
                  ? 'border-sky-500/40 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20'
                  : idx % 4 === 1
                    ? 'border-violet-500/40 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20'
                    : idx % 4 === 2
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20'
                      : 'border-amber-500/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="mt-5 hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-3 md:block">
          <Chat socket={socketRef.current} roomPin={pin} title="Room Chat" />
        </div>

        <button
          onClick={() => setChatDrawerOpen(true)}
          className="fixed bottom-4 right-4 z-30 rounded-full border border-emerald-500/40 bg-slate-900/95 px-5 py-3 text-sm font-black tracking-[0.16em] text-emerald-300 shadow-lg shadow-black/40 transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0 active:scale-95 md:hidden"
        >
          CHAT
        </button>

        {chatDrawerOpen && (
          <>
            <button
              aria-label="Close chat drawer"
              onClick={() => setChatDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
            />
            <div className="fixed inset-x-0 bottom-0 z-50 flex h-[62vh] max-h-[560px] flex-col rounded-t-3xl border border-slate-700 bg-slate-950 p-3 shadow-2xl shadow-black/60 md:hidden">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Room Chat</p>
                <button
                  onClick={() => setChatDrawerOpen(false)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <Chat socket={socketRef.current} roomPin={pin} title="Room Chat" />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (phase === 'waiting') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3 p-5 animate-phase-in">
        <button onClick={handleLeaveRoom} className="absolute top-5 left-5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-200 transition hover:bg-slate-800">Leave</button>
        <p className="text-3xl font-black tracking-tight">{roomName || 'Lobby'}</p>
        <p className="text-slate-400 text-sm font-mono">Waiting for host to start...</p>
        <p className={`text-xs font-mono mt-2 ${connected ? 'text-emerald-400' : 'text-amber-300'}`}>
          {connected ? 'connected' : 'reconnecting...'}
        </p>

        <div className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Chat Mode: <span className={`${chatMode === 'FREE' ? 'text-emerald-300' : chatMode === 'RESTRICTED' ? 'text-amber-200' : 'text-slate-500'}`}>{modeLabels[chatMode] || chatMode}</span>
        </div>

        <div className="w-full max-w-md mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <Chat socket={socketRef.current} roomPin={pin} title="Lobby Chat" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(16,185,129,0.20),rgba(2,6,23,0)_70%)]" />
      <button onClick={handleBack} className="absolute top-5 left-5 text-slate-500 hover:text-white text-sm transition-colors">back</button>
      <div className="z-10 w-full max-w-sm animate-phase-in rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/30">
        <h1 className="text-5xl font-black tracking-tight mb-8">Join Game</h1>
        <div className="w-full flex flex-col gap-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-lg font-semibold text-white placeholder-slate-500 transition-colors focus:border-emerald-400 focus:outline-none"
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="Room PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4 text-lg font-semibold tracking-[0.35em] text-white placeholder-slate-500 transition-colors focus:border-emerald-400 focus:outline-none"
        />
        {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-mono text-red-300">{error}</p>}
        <button
          onClick={handleJoin}
          disabled={!connected}
          className="w-full rounded-2xl bg-emerald-400 py-5 text-xl font-black text-black transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-300 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          JOIN
        </button>
          <div className={`mt-1 flex items-center justify-center gap-2 text-xs font-mono ${connected ? 'text-emerald-400' : 'text-amber-300'}`}>
            {connected ? (
              <span>connected</span>
            ) : (
              <>
                <span>connecting</span>
                <span className="status-dot" />
                <span className="status-dot" />
                <span className="status-dot" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}