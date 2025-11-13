import React from 'react';
import { View, Text } from 'react-native';

export default ({ message, meId })=>{
  const isMe = message.sender === meId;
  return (
    <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', backgroundColor: isMe ? '#dcf8c6' : '#fff', padding:8, marginVertical:4, borderRadius:8, maxWidth:'80%'}}>
      <Text>{message.text}</Text>
      <Text style={{fontSize:10, textAlign:'right'}}>{new Date(message.createdAt).toLocaleTimeString()}</Text>
      <Text style={{fontSize:10, textAlign:'right'}}>{(message.readBy && message.readBy.length>0) ? '✓✓' : '✓'}</Text>
    </View>
  );
}
