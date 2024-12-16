import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import CurrencyRatesScreen from './screens/CurrencyRatesScreen';
import WalletsScreen from './screens/WalletsScreen';
import TransactionHistoryScreen from './screens/TransactionHistoryScreen';
import UserProfileScreen from './screens/UserProfileScreen';

// Import icons from react-native-vector-icons
import Icon from 'react-native-vector-icons/FontAwesome';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="TabDashboard"  // Change to the new unique name
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: '#f8f9fa',
          borderTopWidth: 0,
          paddingBottom: 5,
        },
        headerShown: false, // Disable headers for all tabs
      }}
    >
      <Tab.Screen
        name="TabDashboard"  // Unique name for the tab screen
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CurrencyRates"
        component={CurrencyRatesScreen}
        options={{
          tabBarLabel: 'Currency Rates',
          tabBarIcon: ({ color, size }) => (
            <Icon name="usd" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Wallets"
        component={WalletsScreen}
        options={{
          tabBarLabel: 'Wallets',
          tabBarIcon: ({ color, size }) => (
            <Icon name="credit-card" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
        options={{
          tabBarLabel: 'Transaction History',
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen 
          name="Dashboard" 
          children={() => <BottomTabNavigator />}  // Wrap BottomTabNavigator as a child component
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
