// TransactionHistoryScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TransactionHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      <Text style={styles.content}>Here you can view your transaction history.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
});
