import { useEffect, useRef, useState } from 'react';
import { connectWS } from '../api/client';

export function useWebSocket(path, onMessage) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!path) return;
    let ws = null;
    let timeoutId = null;

    const connect = () => {
      ws = connectWS(path);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch (err) {
          console.error('WS message parse error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Try reconnecting after 3 seconds
        timeoutId = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('WS error:', err);
        ws.close();
      };
    };

    connect();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (wsRef.current) wsRef.current.close();
    };
  }, [path]);

  const send = (data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  return { isConnected, send };
}
