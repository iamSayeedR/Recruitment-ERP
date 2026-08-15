'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketContextType {
  connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({ connected: false });

export const useWebSocketContext = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = React.useState(false);

  useEffect(() => {
    const tenantId = (session as any)?.tenantId || (session?.user as any)?.tenantId;
    if (!tenantId) return;

    const client = new Client({
      brokerURL: 'ws://localhost:8085/ws',
      reconnectDelay: 1000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/tenant/${tenantId}/*`, (message) => {
          if (message.body) {
            try {
              const event = JSON.parse(message.body);
              // Invalidate queries based on event type
              if (event.type) {
                queryClient.invalidateQueries(); // Broadly invalidate for simplicity, or target specific keys
              }
            } catch (e) {
              console.error('Failed to parse WebSocket message', e);
            }
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
      },
    });

    // Custom backoff implementation since STOMPJS only has static reconnectDelay
    // We can simulate exponential backoff by listening to WebSocket close
    // But for simplicity, we'll configure a reasonable static one if custom logic is too complex
    // To truly implement 1s, 2s, 4s max 30s:
    let attempt = 0;
    client.beforeConnect = () => {
      attempt++;
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
      client.reconnectDelay = delay;
    };
    client.onConnect = () => {
      attempt = 0; // reset on successful connect
      client.reconnectDelay = 1000;
      setConnected(true);
      client.subscribe(`/topic/tenant/${tenantId}/#`, (message) => {
        if (message.body) {
          queryClient.invalidateQueries();
        }
      });
      client.subscribe(`/topic/tenant/${tenantId}/*`, (message) => {
        if (message.body) {
          queryClient.invalidateQueries();
        }
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [session, queryClient]);

  return (
    <WebSocketContext.Provider value={{ connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
