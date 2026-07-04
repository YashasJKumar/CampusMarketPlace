import { Ionicons } from '@expo/vector-icons';
import React, { useState, useContext } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import Context and Provider
import { MarketplaceProvider, MarketplaceContext } from './MarketplaceContext.js';

// Import Screens
import FeedScreen from './screens/FeedScreen.js';
import AddItemScreen from './screens/AddItemScreen.js';
import LoginScreen from './screens/LoginScreen.js';
import SignUpScreen from './screens/SignUpScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';

const Tab = createBottomTabNavigator();

function MainApp() {
  const { currentUser } = useContext(MarketplaceContext);
  
  // Controls whether the user sees the Login or Sign Up screen
  const [authMode, setAuthMode] = useState('login');

  // If no user is logged in, restrict them to the Auth flow
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