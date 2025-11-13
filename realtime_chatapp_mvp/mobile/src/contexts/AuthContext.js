import React, { createContext, useState, useEffect } from 'react';
import API, { setToken } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children })=>{
  const [user, setUser] = useState(null);
  const [token, setLocalToken] = useState(null);

  useEffect(()=>{
    (async ()=>{
      const t = await AsyncStorage.getItem('token');
      const u = await AsyncStorage.getItem('user');
      if (t && u) { setToken(t); setLocalToken(t); setUser(JSON.parse(u)); }
    })();
  },[]);

  const login = async (email,password)=>{
    const res = await API.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setLocalToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name,email,password)=>{
    const res = await API.post('/auth/register', { name,email,password });
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setLocalToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async ()=>{
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setLocalToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, register, logout }}>{children}</AuthContext.Provider>
}
