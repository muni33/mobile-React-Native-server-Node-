import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, FlatList, TextInput, Button } from 'react-native';
import API from '../api/api';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import MessageItem from '../components/MessageItem';

export default function ChatScreen({ route }) {
  const { otherUser } = route.params;
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const conversationIdRef = useRef(null);

  useEffect(()=>{
    (async ()=>{
      if (otherUser.conversationId) {
        conversationIdRef.current = otherUser.conversationId;
        const res = await API.get(`/conversations/${conversationIdRef.current}/messages`);
        setMessages(res.data);
      } else setMessages([]);
    })();
  },[]);

  useEffect(()=>{
    if (!socket) return;
    socket.on('message:new', (msg)=>{
      if (!conversationIdRef.current || msg.conversation.toString() === conversationIdRef.current.toString())
        setMessages(m=>[...m, msg]);
      // acknowledge delivery (optional)
      socket.emit('message:read', { messageId: msg._id });
    });
    socket.on('typing:start', ({ from }) => { /* show typing */ });
    socket.on('typing:stop', ({ from }) => { /* hide typing */ });
    socket.on('message:read', ({ messageId, by })=>{
      setMessages(m=> m.map(msg => msg._id === messageId ? {...msg, readBy: [...(msg.readBy||[]), by]} : msg));
    });
    return ()=> {
      socket.off('message:new');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('message:read');
    };
  }, [socket]);

  const send = ()=>{
    if (!socket) return;
    socket.emit('message:send', { conversationId: conversationIdRef.current, toUserId: otherUser._id, text });
    setText('');
  };

  return (
    <View style={{flex:1}}>
      <FlatList
        data={messages}
        keyExtractor={i=>i._id}
        renderItem={({item})=> <MessageItem message={item} meId={user.id} />}
        contentContainerStyle={{padding:10}}
      />
      <View style={{flexDirection:'row', padding:8}}>
        <TextInput value={text} onChangeText={(t)=> { setText(t); socket?.emit('typing:start', { conversationId: conversationIdRef.current, toUserId: otherUser._id }) }} style={{flex:1, borderWidth:1, padding:8}} />
        <Button title="Send" onPress={send} />
      </View>
    </View>
  );
}
