import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async ()=>{
    try {
      await login(email, password);
      navigation.replace('Home');
    } catch(err) {
      alert('Login failed');
    }
  };

  return (
    <View style={{flex:1, justifyContent:'center', padding:20}}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{borderWidth:1, marginBottom:10, padding:8}} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{borderWidth:1, marginBottom:10, padding:8}} />
      <Button title="Login" onPress={onLogin} />
      <Text style={{marginTop:10, textAlign:'center'}} onPress={()=> navigation.navigate('Register')}>No account? Register</Text>
    </View>
  );
}
