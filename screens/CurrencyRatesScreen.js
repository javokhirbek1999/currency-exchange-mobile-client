import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Date Picker for selecting date

export default function CurrencyRatesScreen() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [archivedRates, setArchivedRates] = useState([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [errorArchived, setErrorArchived] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    const fetchCurrencyRates = async () => {
      try {
        // Fetch data from all tables (A, B, and C)
        const responseA = await fetch('https://api.nbp.pl/api/exchangerates/tables/A?format=json');
        const responseB = await fetch('https://api.nbp.pl/api/exchangerates/tables/B?format=json');
        const responseC = await fetch('https://api.nbp.pl/api/exchangerates/tables/C?format=json');

        const dataA = await responseA.json();
        const dataB = await responseB.json();
        const dataC = await responseC.json();

        // Combine the data from all tables into a single array
        const allRates = [
          ...dataA[0].rates,
          ...dataB[0].rates,
          ...dataC[0].rates,
        ];

        // Remove duplicates by currency code (code is unique for each currency)
        const uniqueRates = [];
        const seenCodes = new Set();

        allRates.forEach(rate => {
          if (!seenCodes.has(rate.code)) {
            seenCodes.add(rate.code);
            uniqueRates.push(rate);
          }
        });

        setRates(uniqueRates);
      } catch (err) {
        setError('Failed to fetch currency rates');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencyRates();
  }, []);

  const fetchArchivedRates = async (date) => {
    try {
      setLoadingArchived(true);
      setErrorArchived(null);

      console.log("Fetching archived rates for date:", date);  // Log the selected date

      // Adding headers to handle CORS issue if needed
      const headers = {
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': '*',  // Uncomment if you encounter CORS issues
      };

      // Fetch archived rates for selected date with headers
      const responseA = await fetch(`https://api.nbp.pl/api/exchangerates/tables/A/${date}?format=json`, { headers });
      const responseB = await fetch(`https://api.nbp.pl/api/exchangerates/tables/B/${date}?format=json`, { headers });
      const responseC = await fetch(`https://api.nbp.pl/api/exchangerates/tables/C/${date}?format=json`, { headers });

      // Log the response status codes
      console.log("Response A status:", responseA.status);
      console.log("Response B status:", responseB.status);
      console.log("Response C status:", responseC.status);

      // Handle the case where one of the responses returns 404
      if (!responseA.ok && responseA.status !== 404) {
        throw new Error("Failed to fetch data for table A");
      }
      if (!responseB.ok && responseB.status !== 404) {
        throw new Error("Failed to fetch data for table B");
      }
      if (!responseC.ok && responseC.status !== 404) {
        throw new Error("Failed to fetch data for table C");
      }

      const dataA = responseA.ok ? await responseA.json() : [];
      const dataB = responseB.ok ? await responseB.json() : [];
      const dataC = responseC.ok ? await responseC.json() : [];

      // Combine the data from all tables into a single array
      const allRates = [
        ...dataA[0]?.rates || [],
        ...dataB[0]?.rates || [],
        ...dataC[0]?.rates || [],
      ];

      // Remove duplicates by currency code (code is unique for each currency)
      const uniqueRates = [];
      const seenCodes = new Set();

      allRates.forEach(rate => {
        if (!seenCodes.has(rate.code)) {
          seenCodes.add(rate.code);
          uniqueRates.push(rate);
        }
      });

      setArchivedRates(uniqueRates);
      console.log("Archived Rates: ", uniqueRates);  // Log the fetched archived rates
    } catch (err) {
      setErrorArchived('Failed to fetch archived currency rates');
      console.error("Error fetching archived rates: ", err);  // Log any errors
    } finally {
      setLoadingArchived(false);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (date) => {
    const formattedDate = date.toISOString().split('T')[0];  // Format to YYYY-MM-DD
    setSelectedDate(formattedDate);
    fetchArchivedRates(formattedDate);
    hideDatePicker();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading currency rates...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Currency Rates</Text>
      </View>
      <Text style={styles.content}>Here you can view the latest currency exchange rates.</Text>

      <Button title="Select Date for Archived Rates" onPress={showDatePicker} />

      {selectedDate && !loadingArchived && (
        <Text style={styles.dateInfo}>Archived Exchange Rates for {selectedDate}</Text>
      )}

      {loadingArchived ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
      ) : (
        archivedRates.length > 0 && (
          <ScrollView style={styles.ratesContainer}>
            {archivedRates.map((rate, index) => (
              <View key={index} style={styles.rateItem}>
                <Text style={styles.currencyName}>{rate.currency}</Text>
                <Text style={styles.currencyCode}>{rate.code}</Text>
                <Text style={styles.currencyRate}>{rate.mid} PLN</Text>
              </View>
            ))}
          </ScrollView>
        )
      )}

      <Text style={styles.content}>Current Currency Exchange Rates:</Text>

      <ScrollView style={styles.ratesContainer}>
        {rates.map((rate, index) => (
          <View key={index} style={styles.rateItem}>
            <Text style={styles.currencyName}>{rate.currency}</Text>
            <Text style={styles.currencyCode}>{rate.code}</Text>
            <Text style={styles.currencyRate}>{rate.mid} PLN</Text>
          </View>
        ))}
      </ScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
  },
  ratesContainer: {
    width: '100%',
  },
  rateItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  currencyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  currencyCode: {
    fontSize: 16,
    color: '#555',
  },
  currencyRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  dateInfo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
});
