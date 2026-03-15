import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Chat from './Chat';
import HostModeration from './HostModeration';

export default function Host({ onBack }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [pin, setPin] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  const [phase, setPhase] = useState('setup');
  const [question, setQuestion] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [qTotal, setQTotal] = useState(0);
  const [answerCount, setAnswerCount] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [finalScores, setFinalScores] = useState([]);
  const [mutedSet, setMutedSet] = useState(new Set());
  const [chatMode, setChatMode] = useState('OFF');
  const [allowedList, setAllowedList] = useState([]);
  const [newAllowedText, setNewAllowedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [availableDecks, setAvailableDecks] = useState([]);
  const [deckLabel, setDeckLabel] = useState('Default');

  useEffect(() => {
    const socket = io(`http://${window.location.hostname}:3000`, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    // keep host view of chat mode in sync
    socket.on('chat:mode', ({ mode, allowed }) => { setChatMode(mode); if (allowed) setAllowedList(allowed); });
    
    socket.on('player_joined', ({ players }) => setPlayers(players));
    socket.on('room_closed', ({ message }) => { setError(message); setPhase('setup'); setPin(null); });
    socket.on('game_started', () => setPhase('question'));
    socket.on('next_question', ({ question, index, total }) => {
      setQuestion(question);
      setQIndex(index);
      setQTotal(total);
      setAnswerCount(0);
      setResultData(null);
      setPhase('question');
    });
    socket.on('answer_count', ({ count }) => setAnswerCount(count));
    socket.on('question_result', (data) => { setResultData(data); setPhase('result'); });
    socket.on('game_over', ({ scores }) => { setFinalScores(scores); setPhase('gameover'); });
    socket.on('chat:muted', () => {});
    socket.on('chat:unmuted', () => {});
    // listen for moderator updates if server emits them
    socket.on('chat:moderation', ({ action, target }) => {
      setMutedSet((s) => {
        const next = new Set(Array.from(s));
        if (action === 'mute') next.add(target);
        if (action === 'unmute') next.delete(target);
        return next;
      });
    });
    return () => socket.disconnect();
  }, []);

  // Fetch available decks on mount
  useEffect(() => {
    fetch(`http://${window.location.hostname}:3000/api/decks`)
      .then(r => r.json())
      .then(decks => {
        setAvailableDecks(decks);
        if (decks.length > 0) {
          setDeckLabel(decks[0].name);
        }
      })
      .catch(err => console.error('Failed to fetch decks:', err));
  }, []);

  const handleCreate = () => {
    if (!roomName.trim()) return setError('Enter a room name.');
    if (!socketRef.current?.connected) return setError('Not connected.');
    setError('');
    socketRef.current.emit('create_room', { roomName }, (res) => {
      if (res.success) { setPin(res.pin); setPhase('lobby');
        // apply the selected chat mode immediately for the new room
        if (chatMode) {
          const payload = { pin: res.pin, mode: chatMode };
          if (chatMode === 'RESTRICTED') payload.allowed = allowedList;
          socketRef.current.emit('chat:host_set_mode', payload, (ack) => {
            if (!ack?.ok) setError(ack?.reason || 'Failed to set chat mode');
          });
        }
      }
      else setError('Failed to create room.');
    });
  };

  const handleStart = () => {
    if (!socketRef.current?.connected) return setError('Lost connection.');
    setError('');
    socketRef.current.emit('start_game', { pin }, (res) => {
      if (!res?.success) setError(res?.error || 'Could not start.');
    });
  };

  const handleNext = () => {
    socketRef.current.emit('next_question', { pin });
  };

  const handleMute = (socketId) => {
    socketRef.current.emit('chat:host_mute', { target: socketId }, (ack) => {
      if (ack?.ok) setMutedSet((s) => new Set([...s, socketId]));
    });
  };

  const handleUnmute = (socketId) => {
    socketRef.current.emit('chat:host_unmute', { target: socketId }, (ack) => {
      if (ack?.ok) setMutedSet((s) => { const n = new Set([...s]); n.delete(socketId); return n; });
    });
  };

  const applyChatMode = (mode) => {
    if (!socketRef.current?.connected) return setError('Not connected');
    setError('');
    // confirmation
    if (!window.confirm(`Set chat mode to ${mode}?`)) return;
    const payload = { pin, mode };
    if (mode === 'RESTRICTED') payload.allowed = allowedList;
    socketRef.current.emit('chat:host_set_mode', payload, (ack) => {
      if (!ack?.ok) setError(ack?.reason || 'Failed to set chat mode');
    });
  };

  if (phase === 'gameover') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col p-6 pt-10">
        <p className="text-xs text-zinc-500 font-mono mb-8">final scores</p>
        <h2 className="text-3xl font-black mb-8">Results</h2>
        <div className="flex flex-col gap-3 flex-1">
          {finalScores.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
              <span className="text-zinc-500 font-mono text-sm w-6">{i + 1}</span>
              <span className="flex-1 font-semibold">{p.name}</span>
              <span className="font-black text-yellow-400">{p.score}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'result' && resultData) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col p-6 pt-10">
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs text-zinc-500 font-mono">Q{qIndex + 1} / {qTotal}</p>
          <span className={`text-xs font-mono ${connected ? 'text-green-500' : 'text-red-500'}`}>{connected ? 'live' : 'offline'}</span>
        </div>
        <p className="text-xs text-zinc-600 mb-2">correct answer</p>
        <p className="text-2xl font-black text-yellow-400 mb-10">{resultData.correct_answer}</p>
        <p className="text-xs text-zinc-600 mb-4">scores</p>
        <div className="flex flex-col gap-2 flex-1">
          {[...resultData.scores].sort((a, b) => b.score - a.score).map((p, i) => (
            <div key={p.name} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
              <span className="text-zinc-500 font-mono text-sm w-6">{i + 1}</span>
              <span className="flex-1 font-semibold">{p.name}</span>
              <span className="font-black text-yellow-400">{p.score}</span>
            </div>
          ))}
        </div>
        <button onClick={handleNext} className="w-full mt-8 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black text-xl py-4 rounded-xl transition-all duration-100">
          {qIndex + 1 >= qTotal ? 'FINISH' : 'NEXT QUESTION'}
        </button>
      </div>
    );
  }

  if (phase === 'question' && question) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col p-6 pt-10">
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs text-zinc-500 font-mono">Q{qIndex + 1} / {qTotal}</p>
          <span className="text-xs font-mono text-zinc-500">{answerCount} / {players.length} answered</span>
        </div>
        <p className="text-xl font-bold leading-snug flex-1">{question.prompt}</p>
        <div className="grid grid-cols-2 gap-3 mt-8 mb-6">
          {question.options.map((opt) => (
            <div key={opt} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-300">
              {opt}
            </div>
          ))}
        </div>

        {/* chat mode control for host */}
        <div className="mb-4 flex items-center gap-2">
          <select value={chatMode} onChange={(e) => setChatMode(e.target.value)} className="bg-zinc-900 rounded-xl px-3 py-2 text-sm">
            <option value="OFF">OFF</option>
            <option value="RESTRICTED">RESTRICTED</option>
            <option value="FREE">FREE</option>
          </select>
          <button onClick={() => applyChatMode(chatMode)} className="bg-yellow-400 px-3 py-2 rounded-xl font-black">Set Chat</button>
        </div>
        {chatMode === 'RESTRICTED' && (
          <div className="mb-4">
            <p className="text-xs text-zinc-400 mb-2">Pre-canned messages (visible to players)</p>
            <div className="flex gap-2 mb-2">
              <input value={newAllowedText} onChange={(e) => setNewAllowedText(e.target.value)} placeholder="Add message" className="flex-1 bg-zinc-900 rounded-xl px-3 py-2 text-white text-sm" />
              <button onClick={() => {
                const t = newAllowedText.trim(); if (!t) return; const id = `c_${Date.now().toString(36)}`;
                setAllowedList((s) => [...s.slice(0, 11), { id, text: t }]); // limit to 12 items in UI
                setNewAllowedText('');
              }} className="bg-zinc-700 px-3 py-2 rounded-xl">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allowedList.map((a) => (
                <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm flex items-center gap-2">
                  <span className="text-zinc-300">{a.text}</span>
                  <button onClick={() => setAllowedList((s) => s.filter(x => x.id !== a.id))} className="text-red-400 text-xs">Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <Chat socket={socketRef.current} roomPin={pin} />
        </div>

        <button onClick={handleNext} className="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-black text-lg py-4 rounded-xl transition-all duration-100">
          REVEAL ANSWER
        </button>
      </div>
    );
  }

  if (phase === 'lobby') {
    const joinUrl = `${window.location.origin}/?pin=${pin}`;
    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch (e) {
        console.error('copy failed', e);
      }
    };

    return (
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-black to-slate-950 text-white flex gap-4 p-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/3 rounded-full blur-3xl"></div>
        </div>

        {/* LEFT SIDE - Main Content (3/4 width) */}
        <div className="relative z-10 flex-1 flex flex-col gap-6 overflow-y-auto max-h-screen pb-6">
          
          {/* Top header */}
          <header className="w-full flex items-center justify-between gap-4 pb-4 border-b border-emerald-900/30">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="text-slate-400 text-sm px-3 py-2 rounded-lg hover:bg-emerald-900/20 transition-colors">← Back</button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center text-white text-xs font-black">+</div>
                <div className="text-xl font-black tracking-tight text-emerald-400">LocalFlux</div>
              </div>
              <div className="text-xs text-slate-500 ml-4">Host Dashboard</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-900/20 rounded-lg border border-emerald-800/30">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-emerald-400 font-semibold">Session Active</span>
            </div>
          </header>

          {/* Top section - PIN/URL merged + Deck selector */}
          <section className="grid grid-cols-2 gap-6">
            
            {/* PIN + URL Merged Card (Left) */}
            <div className="bg-slate-900/50 border border-emerald-900/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-xs uppercase text-slate-400 tracking-widest mb-4">Room PIN & Join Link</div>
              
              <div className="mb-6">
                <div className="text-xs text-slate-500 mb-1">PIN</div>
                <div className="text-5xl font-black text-emerald-400 tracking-tight">{pin || '----'}</div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-slate-500 mb-2">Join URL</div>
                <input type="text" value={joinUrl} readOnly className="w-full bg-slate-950/50 border border-emerald-800/30 rounded-lg px-3 py-2 text-xs text-slate-300 mb-2 font-mono" />
                <button onClick={copyLink} className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  {copied ? <span className="text-emerald-200">✓ Copied!</span> : <span>📋 Copy Link</span>}
                </button>
              </div>

              <div className="mb-4 shrink-0">
                <div className="text-xs text-slate-500 mb-2">QR Code</div>
                <div className="bg-white p-2 rounded-lg inline-block">
                  <img alt="QR code" src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(joinUrl)}`} className="w-24 h-24" />
                </div>
              </div>
            </div>

            {/* Deck Selector Card (Right) */}
            <div className="bg-slate-900/50 border border-emerald-900/30 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
              <div className="text-xs uppercase text-slate-400 tracking-widest mb-4">Active Deck</div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <div className="font-semibold text-sm text-emerald-300">{deckLabel}</div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-slate-500 block mb-2">Select Deck</label>
                <select 
                  value={deckLabel} 
                  onChange={(e) => setDeckLabel(e.target.value)}
                  className="w-full bg-slate-950/50 border border-emerald-800/30 rounded-lg px-3 py-2 text-sm text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  {availableDecks.map((deck) => (
                    <option key={deck.name} value={deck.name}>
                      {deck.name} ({deck.count} questions)
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-slate-500">Ready to play</div>
            </div>
          </section>

          {/* Player Roster Section */}
          <section className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs uppercase text-slate-400 tracking-widest">Players</span>
              <div className="px-2 py-1 bg-emerald-600 rounded-full text-xs font-bold text-white">{players.length}</div>
            </div>

            {players.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                <div className="text-center">
                  <p className="mb-2">👤 No players yet</p>
                  <p className="text-xs text-slate-600">waiting for joins...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 flex-1">
                {players.map((p, i) => (
                  <div 
                    key={p.id} 
                    className="group relative animate-slide-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="bg-slate-900/50 border border-emerald-900/30 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-emerald-900/30 hover:border-emerald-600/50 transition-all duration-300 cursor-pointer backdrop-blur-sm group-hover:shadow-lg group-hover:shadow-emerald-500/20">
                      
                      {/* Avatar Circle */}
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/50 mb-3 group-hover:scale-110 transition-transform duration-300">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-white font-bold text-lg">
                          {p.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      </div>

                      {/* Player Name */}
                      <div className="font-semibold text-sm text-center truncate w-full px-2">
                        {p.name}
                      </div>

                      {/* Player Index */}
                      <div className="text-xs text-slate-500 mt-1">#{i + 1}</div>

                      {/* Hover effect accent */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-linear-to-br from-emerald-500/10 to-transparent"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bottom control bar */}
          <footer className="w-full pt-4 border-t border-emerald-900/30 flex items-center justify-between gap-6 shrink-0">
            <div className="flex items-center gap-3 bg-slate-900/50 border border-emerald-900/30 rounded-xl px-4 py-3 backdrop-blur-sm">
              <span className="text-xs uppercase text-slate-400 tracking-wider">Chat Mode</span>
              <select value={chatMode} onChange={(e) => setChatMode(e.target.value)} className="bg-slate-950/80 border border-emerald-800/30 rounded-lg px-3 py-2 text-sm text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500">
                <option value="OFF">OFF</option>
                <option value="FREE">FREE</option>
                <option value="RESTRICTED">RESTRICTED</option>
              </select>
            </div>

            <button
              onClick={handleStart}
              disabled={players.length === 0}
              className={`px-8 py-3 rounded-xl font-black text-lg transition-all duration-200 flex items-center gap-2 shrink-0 ${
                players.length === 0
                  ? 'bg-slate-700 text-slate-400 opacity-40 cursor-not-allowed'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/50 active:scale-95'
              }`}>
              <span>▶</span> START GAME
            </button>
          </footer>
        </div>

        {/* RIGHT SIDE - Chat Monitor (1/4 width) */}
        <aside className="relative z-10 w-1/4 flex flex-col min-w-64 max-h-screen pb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-emerald-900/30">
            <span className="text-xs uppercase text-slate-400 tracking-widest">Chat Monitor</span>
            <span className="text-xs text-emerald-400 font-semibold">READ ONLY</span>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-900/50 border border-emerald-900/30 rounded-xl p-4 backdrop-blur-sm">
            <Chat socket={socketRef.current} roomPin={pin} readOnly />
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <button onClick={onBack} className="absolute top-5 left-5 text-zinc-600 hover:text-white text-sm transition-colors">back</button>
      <h1 className="text-5xl font-black tracking-tighter mb-10">New room</h1>
      <div className="w-full max-w-xs">
        <input
          type="text"
          placeholder="Room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          className="w-full bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-xl px-4 py-4 text-white text-lg font-semibold placeholder-zinc-600 focus:outline-none transition-colors mb-3"
        />
        {error && <p className="text-red-500 text-xs mb-3 font-mono">{error}</p>}
        <button onClick={handleCreate} disabled={!connected} className="w-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 disabled:opacity-30 text-black font-black text-xl py-4 rounded-xl transition-all duration-100">
          CREATE
        </button>
        <p className={`text-center text-xs mt-3 font-mono ${connected ? 'text-green-500' : 'text-yellow-500'}`}>
          {connected ? 'connected' : 'connecting...'}
        </p>
      </div>
    </div>
  );
}