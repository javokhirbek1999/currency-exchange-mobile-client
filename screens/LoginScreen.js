import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axiosInstance from '../axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing token and user data

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setNotification('Please fill in all fields');
      setNotificationType('error');
      return;
    }

    setLoading(true);
    setNotification(''); // Reset previous notification
    setNotificationType(''); // Reset notification type

    try {
      // Send POST request to the login endpoint (users/token)
      const response = await axiosInstance.post('/users/login/', {
        email,
        password,
      });

      setLoading(false);

      // Assuming the backend returns a token and user data
      if (response.data.token) {
        // Store the token in AsyncStorage
        await AsyncStorage.setItem('auth_token', response.data.token);

        // Store user data in AsyncStorage
        await AsyncStorage.setItem('user_data', JSON.stringify({
          user_id: response.data.user_id,
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          date_joined: response.data.date_joined,
          date_updated: response.data.date_updated,
        }));

        // Navigate to Dashboard after successful login
        navigation.navigate('Dashboard'); // Replace 'Dashboard' with actual screen name
      } else {
        setNotification('Wrong email or wrong password');
        setNotificationType('error');
      }
    } catch (error) {
      setLoading(false);
      console.error('Login Error:', error);

      // Handle different error types and display specific messages
      if (error.response) {
        // If the server responded with an error (e.g., wrong credentials)
        setNotification('Wrong email or wrong password');
        setNotificationType('error');
      } else if (error.request) {
        // If no response was received
        setNotification('No response from server. Please check your internet connection.');
        setNotificationType('error');
      } else {
        // General error
        setNotification('Something went wrong. Please try again later.');
        setNotificationType('error');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>

      {/* Display Notification */}
      {notification && (
        <Text style={[styles.notification, notificationType === 'error' ? styles.error : styles.success]}>
          {notification}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerText: {
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  notification: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  success: {
    color: '#28a745', // Green color for success
  },
  error: {
    color: '#d9534f', // Red color for errors
  },
});
