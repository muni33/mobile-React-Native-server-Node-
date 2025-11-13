import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import API from '../api/api';
import { AuthContext } from '../contexts/AuthContext';

export default function HomeScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(()=>{
    (async ()=>{
      const res = await API.get('/users');
      setUsers(res.data);
    })();
  },[]);

  return (
    <View style={{flex:1, padding:10}}>
      <FlatList
        data={users}
        keyExtractor={i=>i._id}
        renderItem={({item})=>(
          <TouchableOpacity onPress={()=> navigation.navigate('Chat', { otherUser: item })} style={{padding:12, borderBottomWidth:1}}>
            <Text style={{fontWeight:'bold'}}>{item.name} {item.online ? '🟢' : '⚪️'}</Text>
            { item.lastMessage && <Text numberOfLines={1}>{item.lastMessage.text}</Text> }
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
