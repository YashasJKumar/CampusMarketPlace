import React, { useContext, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FeedScreen from './screens/FeedScreen';
import AddItemScreen from './screens/AddItemScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen'; // Import the new screen
import { MarketplaceProvider, MarketplaceContext } from './MarketplaceContext'; 

const Tab = createBottomTabNavigator();

function MainApp() {
  const { currentUser } = useContext(MarketplaceContext);
  // State to track whether we show Login or Sign Up
  const [authMode, setAuthMode] = useState('signup'); // Default to Sign Up

  // If no user is logged in, show the Auth screens
  if (!currentUser) {
    if (authMode === 'signup') {
      return <SignUpScreen switchMode={() => setAuthMode('login')} />;
    } else {
      return <LoginScreen switchMode={() => setAuthMode('signup')} />;
    }
  }

  // If logged in, show the main tabs
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#3498db', headerStyle: { backgroundColor: '#fff' } }}>
        <Tab.Screen name="Marketplace" component={FeedScreen} options={{ tabBarIconStyle: { display: 'none' }, tabBarLabelPosition: 'beside-icon' }} />
        <Tab.Screen name="List Item" component={AddItemScreen} options={{ tabBarIconStyle: { display: 'none' }, tabBarLabelPosition: 'beside-icon' }} />
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