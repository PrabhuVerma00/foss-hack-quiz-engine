import { useEffect, useRef, useState } from 'react';
import { createGameSocket } from '../backendUrl';

export default function usePing(intervalMs = 2000) {
  const socketRef = useRef(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = createGameSocket();
    socketRef.current = socket;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => {
      setConnected(false);
      setLatencyMs(null);
    };
    const handlePong = ({ timestamp }) => {
      const sentAt = Number(timestamp);
      if (!Number.isFinite(sentAt)) return;
      setLatencyMs(Math.max(0, Date.now() - sentAt));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('server:pong', handlePong);

    const timer = window.setInterval(() => {
      if (!socket.connected) return;
      socket.emit('client:ping', { timestamp: Date.now() });
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('server:pong', handlePong);
      socket.disconnect();
    };
  }, [intervalMs]);

  return { latencyMs, connected };
}
