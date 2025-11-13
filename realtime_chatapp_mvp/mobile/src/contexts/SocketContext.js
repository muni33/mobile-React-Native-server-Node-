import React, { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children })=>{
  const { token } = useContext(AuthContext);
  const socketRef = useRef(null);

  useEffect(()=>{
    if (!token) return;
    const socket = io('http://localhost:4000', { auth: { token } });
    socketRef.current = socket;
    socket.on('connect_error', e => console.log('SOCKET ERR', e.message));
    socket.on('message:new', payload => {
      console.log('incoming msg', payload);
    });
    return ()=> { socket.disconnect(); socketRef.current = null; }
  }, [token]);

  return <SocketContext.Provider value={{ socket: socketRef.current }}>{children}</SocketContext.Provider>
}
