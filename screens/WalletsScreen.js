// WalletsScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WalletsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallets</Text>
      <Text style={styles.content}>Manage your wallets here. You can add, view, or remove wallets.</Text>
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
