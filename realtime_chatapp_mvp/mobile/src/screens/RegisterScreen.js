import React, { useState, useContext } from 'react';
import { View, TextInput, Button } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async ()=>{
    try {
      await register(name,email,password);
      navigation.replace('Home');
    } catch(err) {
      alert('Register failed');
    }
  };

  return (
    <View style={{flex:1, justifyContent:'center', padding:20}}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={{borderWidth:1, marginBottom:10, padding:8}} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{borderWidth:1, marginBottom:10, padding:8}} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{borderWidth:1, marginBottom:10, padding:8}} />
      <Button title="Register" onPress={onRegister} />
    </View>
  );
}
