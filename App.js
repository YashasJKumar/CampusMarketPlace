import { Ionicons } from '@expo/vector-icons';
import React, { useState, useContext } from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { signOut } from 'firebase/auth';
import { auth } from './firebase.js';

import { MarketplaceProvider, MarketplaceContext } from './MarketplaceContext.js';

// Import Screens
import FeedScreen from './screens/FeedScreen.js';
import AddItemScreen from './screens/AddItemScreen.js';
import LoginScreen from './screens/LoginScreen.js';
import SignUpScreen from './screens/SignUpScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';

const Tab = createBottomTabNavigator();

function MainApp() {
  const { currentUser, setCurrentUser } = useContext(MarketplaceContext);
  const [authMode, setAuthMode] = useState('login');

  // 1. User is NOT logged in at all
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.authContainer}>
        {authMode === 'login' ? (
          <LoginScreen switchMode={() => setAuthMode('signup')} />
        ) : (
          <SignUpScreen switchMode={() => setAuthMode('login')} />
        )}
      </SafeAreaView>
    );
  }

  // 2. User IS logged in, BUT email is NOT verified
  if (currentUser && !currentUser.emailVerified) {
    
    // Function to check if they clicked the link
    const checkVerification = async () => {
      await auth.currentUser.reload(); // Force Firebase to fetch latest status
      if (auth.currentUser.emailVerified) {
        setCurrentUser({ ...currentUser, emailVerified: true });
        Alert.alert("Success", "Email verified! Welcome to Campus Marketplace.");
      } else {
        Alert.alert("Not Verified", "You haven't clicked the link yet. Please check your spam folder.");
      }
    };

    return (
      <SafeAreaView style={[styles.authContainer, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Verify Your Email</Text>
        <Text style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: 30 }}>
          We sent a verification link to {currentUser.email}. You must verify it before buying or selling on campus.
        </Text>
        
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#3498db', width: '100%', marginBottom: 15 }]} onPress={checkVerification}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', padding: 15 }}>I Have Verified My Email</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => signOut(auth)}>
          <Text style={{ color: '#e74c3c', fontWeight: 'bold' }}>Log Out</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // If logged in, grant access to the main application tabs
  // If logged in, grant access to the main application tabs
  return (
    <NavigationContainer>
      <Tab.Navigator 
        screenOptions={({ route }) => ({ 
          tabBarActiveTintColor: '#3498db',
          tabBarInactiveTintColor: 'gray',
          headerStyle: { backgroundColor: '#fff' },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Campus Marketplace') {
              iconName = focused ? 'storefront' : 'storefront-outline';
            } else if (route.name === 'List an Item') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Profile') {
              // Add icon logic for the new Profile tab
              iconName = focused ? 'person' : 'person-outline'; 
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Campus Marketplace" component={FeedScreen} />
        <Tab.Screen name="List an Item" component={AddItemScreen} />
        {/* Add the new Profile screen here */}
        <Tab.Screen name="Profile" component={ProfileScreen} /> 
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <MarketplaceProvider>
      <MainApp />
    </MarketplaceProvider>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#fff',
  }
});