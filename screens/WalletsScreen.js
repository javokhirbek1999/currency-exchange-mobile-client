import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import axios from '../axios';

export default function WalletsScreen() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isAddWalletModalVisible, setIsAddWalletModalVisible] = useState(false);
  const [newWalletCurrency, setNewWalletCurrency] = useState('');
  const [addWalletError, setAddWalletError] = useState('');
  
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [selectedWalletCurrency, setSelectedWalletCurrency] = useState(null);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [sourceCurrency, setSourceCurrency] = useState('');
  const [destinationCurrency, setDestinationCurrency] = useState('');

  // Function to fetch wallets
  const fetchWallets = async () => {
    setLoading(true); // Show loading indicator while fetching
    try {
      const response = await axios.get('/wallets/');
      console.log('Wallets response:', response.data);
      setWallets(response.data);
    } catch (err) {
      console.error('Error fetching wallets:', err.response || err.message);
      setError(err.response?.data || 'An error occurred');
    } finally {
      setLoading(false); // Hide loading indicator once fetching is complete
    }
  };

  useEffect(() => {
    fetchWallets(); // Fetch wallets initially
  }, []);

  const handleDeposit = async () => {
    if (!bankAccountNumber || !selectedWalletCurrency || !transactionAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    // Ensure the decimal separator is a dot and not a comma
    const formattedAmount = transactionAmount.replace(',', '.');
  
    // Check if the formatted amount is a valid number
    if (isNaN(formattedAmount) || parseFloat(formattedAmount) <= 0) {
      Alert.alert('Error', 'Invalid deposit amount');
      return;
    }
  
    try {
      const response = await axios.put(`/wallets/${selectedWalletCurrency}/deposit/`, {
        amount: formattedAmount, // Send the amount without rounding
        bank_account_address: bankAccountNumber,
      });
      Alert.alert('Success', 'Deposit completed!');
      setIsDepositModalVisible(false);
      fetchWallets(); // Refresh the wallet data after deposit
    } catch (err) {
      Alert.alert('Error', 'Deposit failed. Please try again.');
      console.error('Deposit Error:', err.response || err.message);
    }
  };
  

  const handleWithdraw = async () => {
    if (!bankAccountNumber || !selectedWalletCurrency || !transactionAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    // Ensure the decimal separator is a dot and not a comma
    const formattedAmount = transactionAmount.replace(',', '.');
  
    // Check if the formatted amount is a valid number
    if (isNaN(formattedAmount) || parseFloat(formattedAmount) <= 0) {
      Alert.alert('Error', 'Invalid withdrawal amount');
      return;
    }
  
    try {
      const response = await axios.put(`/wallets/${selectedWalletCurrency}/withdraw/`, {
        amount: formattedAmount, // Send the amount without rounding
        bank_account_address: bankAccountNumber,
      });
      Alert.alert('Success', 'Withdraw completed!');
      setIsWithdrawModalVisible(false);
      fetchWallets(); // Refresh the wallet data after withdrawal
    } catch (err) {
      let errorMessage = 'Withdraw failed. Please try again.';
      if (err.response) {
        if (err.response.status === 400) {
          // Check for "Insufficient balance" error
          if (err.response.data[0] === "Insufficient balance for this withdrawal.") {
            errorMessage = 'Insufficient balance for this withdrawal.';
          }
          // Check for "Amount too low" error
          else if (err.response.data.amount && err.response.data.amount.includes("Ensure this value is greater than or equal to 0.01")) {
            errorMessage = 'The withdrawal amount must be at least 0.01.';
          } else {
            // Handle other error responses
            errorMessage = err.response.data[0] || 'An unknown error occurred.';
          }
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }
  
      Alert.alert('Error', errorMessage);
    }
  };
  
  
  

  const handleAddWallet = async () => {
    if (!newWalletCurrency) {
      Alert.alert('Error', 'Please enter a currency');
      return;
    }

    try {
      const response = await axios.post('/wallets/', { currency: newWalletCurrency });
      if (response.status === 201) {
        Alert.alert('Success', 'New wallet added!');
        setIsAddWalletModalVisible(false);
        setNewWalletCurrency('');
        fetchWallets(); // Refetch wallets after adding a new wallet
      } else {
        throw new Error('Failed to add wallet');
      }
    } catch (err) {
      if (err.response?.data && Array.isArray(err.response.data)) {
        const errorMessage = err.response.data[0]; // Extract the first error message from the array
        setAddWalletError(errorMessage); // Display the error message in the modal
      } else {
        setAddWalletError('Failed to add new wallet');
      }
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!bankAccountNumber || !transactionAmount || !sourceCurrency || !destinationCurrency) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    // Ensure the decimal separator is a dot and not a comma
    const formattedAmount = transactionAmount.replace(',', '.');
  
    // Check if the formatted amount is a valid number
    if (isNaN(formattedAmount) || parseFloat(formattedAmount) <= 0) {
      Alert.alert('Error', 'Invalid transfer amount');
      return;
    }
  
    try {
      const response = await axios.post(`/wallets/transfer/`, {
        source_currency: sourceCurrency, // Source currency (e.g., USD)
        destination_currency: destinationCurrency, // Destination currency (e.g., EUR)
        to_wallet_address: bankAccountNumber, // Recipient wallet address
        amount: formattedAmount, // Transfer amount
      });
  
      if (response.status === 200) {
        // Success alert
        Alert.alert('Success', 'Transfer completed!');
        setIsTransferModalVisible(false); // Close the modal after success
        fetchWallets(); // Refetch wallets to reflect updated balances
      } else {
        Alert.alert('Error', 'Transfer failed. Please try again.');
      }
    } catch (err) {
      console.error('Transfer Error:', err.response || err.message);
  
      // Error handling based on response
      let errorMessage = 'Transfer failed. Please try again.';
      if (err.response && err.response.data) {
        // Check for specific backend errors if any
        if (err.response.data[0] === "Insufficient balance for this transfer.") {
          errorMessage = 'Insufficient balance for this transfer.';
        } else if (err.response.data.amount && err.response.data.amount.includes("Ensure this value is greater than or equal to 0.01")) {
          errorMessage = 'The transfer amount must be at least 0.01.';
        } else {
          errorMessage = err.response.data[0] || 'An unknown error occurred.';
        }
      }
      Alert.alert('Error', errorMessage);
    }
  };
  
  
  

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
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
      <FlatList
        data={wallets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.currency}</Text>
              <Text style={styles.cardBalance}>
                {item.currency === 'USD' ? `$${item.balance}` : `${item.balance} ${item.currency}`}
              </Text>
            </View>
            <Text style={styles.cardContent}>Address: {item.wallet_address}</Text>

            <View style={styles.buttonContainer}>
              <View style={styles.buttonColumn}>
                <TouchableOpacity
                  style={[styles.button, styles.depositButton]}
                  onPress={() => {
                    setSelectedWalletCurrency(item.currency);
                    setIsDepositModalVisible(true);
                  }}
                >
                  <Text style={styles.buttonText}>Deposit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.withdrawButton]}
                  onPress={() => {
                    setSelectedWalletCurrency(item.currency);
                    setIsWithdrawModalVisible(true);
                  }}
                >
                  <Text style={styles.buttonText}>Withdraw</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.contentContainer}
      />

      {/* Add New Wallet Button */}
      <TouchableOpacity
        style={styles.addWalletButton}
        onPress={() => setIsAddWalletModalVisible(true)}
      >
        <Text style={styles.buttonText}>Add New Wallet</Text>
      </TouchableOpacity>

      {/* Transfer Button */}
      <TouchableOpacity
        style={styles.transferButton}
        onPress={() => setIsTransferModalVisible(true)}
      >
        <Text style={styles.buttonText}>Transfer Funds</Text>
      </TouchableOpacity>

      {/* Add Wallet Modal */}
      <Modal
        visible={isAddWalletModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddWalletModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Wallet</Text>

            {/* Wallet Currency */}
            <Text style={styles.modalLabel}>Currency</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter wallet currency"
              value={newWalletCurrency}
              onChangeText={setNewWalletCurrency}
            />

            {addWalletError && <Text style={styles.errorText}>{addWalletError}</Text>}

            {/* Action Buttons */}
            <View style={styles.modalButtonContainer}>
              <Button
                title="Cancel"
                onPress={() => setIsAddWalletModalVisible(false)}
                color="#f44336"
              />
              <Button
                title="Add Wallet"
                onPress={handleAddWallet}
                color="#007bff"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        visible={isDepositModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDepositModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Deposit Funds</Text>

            {/* Bank Account Number */}
            <Text style={styles.modalLabel}>Bank Account Number</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your bank account number"
              keyboardType="numeric"
              value={bankAccountNumber}
              onChangeText={setBankAccountNumber}
            />

            {/* Amount */}
            <Text style={styles.modalLabel}>Amount</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter Amount"
              keyboardType="numeric"
              value={transactionAmount}
              onChangeText={setTransactionAmount}
            />

            {/* Action Buttons */}
            <View style={styles.modalButtonContainer}>
              <Button
                title="Cancel"
                onPress={() => setIsDepositModalVisible(false)}
                color="#f44336"
              />
              <Button
                title="Deposit"
                onPress={handleDeposit}
                color="#007bff"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={isWithdrawModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Withdraw Funds</Text>

            {/* Bank Account Number */}
            <Text style={styles.modalLabel}>Bank Account Number</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your bank account number"
              keyboardType="numeric"
              value={bankAccountNumber}
              onChangeText={setBankAccountNumber}
            />

            {/* Amount */}
            <Text style={styles.modalLabel}>Amount</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter Amount"
              keyboardType="numeric"
              value={transactionAmount}
              onChangeText={setTransactionAmount}
            />

            {/* Action Buttons */}
            <View style={styles.modalButtonContainer}>
              <Button
                title="Cancel"
                onPress={() => setIsWithdrawModalVisible(false)}
                color="#f44336"
              />
              <Button
                title="Withdraw"
                onPress={handleWithdraw}
                color="#007bff"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        visible={isTransferModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTransferModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Transfer Funds</Text>

            {/* Source Currency Input */}
            <Text style={styles.modalLabel}>Source Currency</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter source currency (e.g., USD)"
              value={sourceCurrency}  // Bind to state
              onChangeText={setSourceCurrency}  // Update source currency on change
            />

            {/* Destination Currency Input */}
            <Text style={styles.modalLabel}>Destination Currency</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter destination currency (e.g., EUR)"
              value={destinationCurrency}  // Bind to state
              onChangeText={setDestinationCurrency}  // Update destination currency on change
            />

            {/* Amount Input */}
            <Text style={styles.modalLabel}>Amount</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={transactionAmount}  // Bind to state
              onChangeText={setTransactionAmount}  // Update amount on change
            />

            {/* Action Buttons */}
            <View style={styles.modalButtonContainer}>
              <Button
                title="Cancel"
                onPress={() => setIsTransferModalVisible(false)}  // Close modal
                color="#f44336"
              />
              <Button
                title="Transfer"
                onPress={handleTransfer}  // Trigger transfer
                color="#007bff"
              />
            </View>
          </View>
        </View>
      </Modal>





    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
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
    backgroundColor: '#f9f9f9',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonColumn: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  depositButton: {
    backgroundColor: '#4caf50',
  },
  withdrawButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addWalletButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  transferButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
