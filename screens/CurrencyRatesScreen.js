// CurrencyRatesScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CurrencyRatesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Currency Rates</Text>
      <Text style={styles.content}>Here you can view the latest currency exchange rates.</Text>
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
