import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import axiosInstance from '../axios';  // Import your custom axios instance
import Icon from 'react-native-vector-icons/MaterialIcons';  // Importing MaterialIcons
import { useFocusEffect } from '@react-navigation/native';  // Import useFocusEffect

export default function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch transactions when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const fetchTransactions = async () => {
    try {
      setLoading(true);  // Set loading true before fetching
      const response = await axiosInstance.get('/transactions/');  // Using axios instance for API call
      setTransactions(response.data);  // Set the transactions data
      setLoading(false);  // Set loading to false after data is fetched
    } catch (error) {
      console.error('Transaction Fetch Error:', error);
      Alert.alert('Error', 'Failed to fetch transaction history');
      setLoading(false);  // Set loading to false even if there's an error
    }
  };

  const renderTransactionItem = ({ item }) => {
    const { transaction_type, amount, date, source_wallet_details } = item;

    // Check if the necessary data exists to avoid undefined errors
    const fromWallet = source_wallet_details?.transferred_from_wallet || {};
    const toWallet = source_wallet_details?.transferred_to_wallet || {};

    let currency = '';
    let fromInfo = '';
    let transactionIcon = null;
    let cardStyle = styles.transactionItem; // Default style for all transaction types

    // Log to check if we are getting the correct transaction type
    // console.log('Transaction Type:', transaction_type); // For debugging

    // For deposits, the "From" field should show BANK [bank_address]
    if (transaction_type === 'DEPOSIT') {
      currency = toWallet.currency || 'N/A';
      fromInfo = `BANK [${source_wallet_details.transferred_from_bank_address}]`;
      transactionIcon = 'attach-money';  // Changed to attach_money for Deposit
    } else if (transaction_type === 'WITHDRAWL') {
      currency = fromWallet.currency || 'N/A';
      fromInfo = `${fromWallet.currency} wallet`;
      transactionIcon = 'money-off';  // Changed to money-off for Withdrawal
    } else if (transaction_type === 'TRANSFER') {
      currency = fromWallet.currency || 'N/A';
      fromInfo = `${fromWallet.currency} wallet`;
      transactionIcon = 'arrow-forward';  // Material Icon for Transfer
    }

    return (
      <TouchableOpacity style={cardStyle}>
        <View style={styles.transactionHeader}>
          <Icon name={transactionIcon} size={30} color="#333" style={styles.transactionIcon} />
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>
              {transaction_type} - {amount} {currency}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(date).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionText}>
            From: {fromInfo}
          </Text>
          <Text style={styles.transactionText}>
            To: {toWallet.currency} wallet
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  transactionItem: {
    padding: 20,
    marginVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff', // White background for all transaction types
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, // Subtle shadow for a raised effect
    shadowOpacity: 0.1, // Light shadow opacity
    shadowRadius: 4, // Soft shadow radius
    elevation: 3, // Elevation for Android
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  transactionIcon: {
    marginRight: 15,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#888',
  },
  transactionDetails: {
    marginTop: 10,
  },
  transactionText: {
    fontSize: 16,
    color: '#555',
  },
});
