import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import axios from '../axios'; // Adjust the import path as necessary
import AsyncStorage from '@react-native-async-storage/async-storage'; // For retrieving user data
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

export default function DashboardScreen({ route }) {
  const [userName, setUserName] = useState('');
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data from AsyncStorage
  const fetchUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUserName(parsedData.first_name); // Set user's first name
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  // Fetch wallets data
  const fetchWallets = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/wallets/');
      setWallets(response.data); // Update state with the new wallets
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data and wallets when the screen is focused or profile updated
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
      fetchWallets();
      if (route.params?.profileUpdated) {
        fetchUserData();  // Re-fetch user data if profile was updated
      }
    }, [route.params?.profileUpdated]) // Dependency on profileUpdated parameter
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Centered Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.title}>Welcome, {userName ? userName : 'User'}!</Text>
      </View>

      {/* Wallets Section */}
      <View style={styles.walletsSection}>
        <Text style={styles.walletsTitle}>Your Wallets</Text>
        {/* Scrollable Wallets List */}
        <ScrollView style={styles.walletsContainer} contentContainerStyle={styles.walletsList}>
          {wallets.length > 0 ? (
            wallets.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.currency}</Text>
                  <Text style={styles.cardBalance}>
                    {item.currency === 'USD' ? `$${item.balance}` : `${item.balance} ${item.currency}`}
                  </Text>
                </View>
                <Text style={styles.cardContent}>Address: {item.wallet_address}</Text>
              </View>
            ))
          ) : (
            <Text>No wallets available</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center', // Centers the greeting vertically
    alignItems: 'center',     // Centers the greeting horizontally
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
  walletsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  walletsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  walletsContainer: {
    maxHeight: 300, // Set a max height for the scrollable area
  },
  walletsList: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  cardBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  cardContent: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
});
