import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../axios';

export default function UserProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',  // Added for password confirmation
  });
  const [originalEmail, setOriginalEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('user_data');
        if (storedUserData) {
          const user = JSON.parse(storedUserData);
          setUserData({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            password: '', // Make password empty initially
            confirm_password: '', // Make confirm_password empty initially
          });
          setOriginalEmail(user.email); // Store the original email for the update request
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch user data');
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    if (!userData.first_name || !userData.last_name) {
      Alert.alert('Error', 'First Name and Last Name are required');
      return;
    }

    if (userData.password && userData.password !== userData.confirm_password) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      // Prepare data for updating
      const updateData = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
      };

      if (userData.password) {
        updateData.password = userData.password;
      }

      const response = await axiosInstance.put(`/users/${originalEmail}/update/`, updateData);
      
      // Update AsyncStorage with the new user data
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data));

      Alert.alert('Success', 'Profile updated successfully');
      setOriginalEmail(userData.email); // Update the original email for future updates
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={userData.first_name}
        onChangeText={(text) => setUserData((prev) => ({ ...prev, first_name: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={userData.last_name}
        onChangeText={(text) => setUserData((prev) => ({ ...prev, last_name: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={userData.email}
        onChangeText={(text) => setUserData((prev) => ({ ...prev, email: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password (optional)"
        secureTextEntry
        value={userData.password}
        onChangeText={(text) => setUserData((prev) => ({ ...prev, password: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={userData.confirm_password}
        onChangeText={(text) => setUserData((prev) => ({ ...prev, confirm_password: text }))}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Profile</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
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
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
