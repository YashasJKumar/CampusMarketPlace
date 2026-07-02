import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MarketplaceContext } from '../MarketplaceContext';

// Import Firebase tools
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginScreen({ switchMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setCurrentUser } = useContext(MarketplaceContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // 1. Verify credentials with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      const user = userCredential.user;

      // 2. Fetch their student details from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // 3. Log them in locally with all their details
        setCurrentUser(userDocSnap.data());
      } else {
        Alert.alert("Error", "User data not found in database.");
      }

    } catch (error) {
      // Firebase handles invalid passwords and missing emails automatically!
      Alert.alert("Login Failed", "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>RVCE Marketplace</Text>
      <Text style={styles.subHeader}>Welcome Back</Text>

      <TextInput style={styles.input} placeholder="Email (@rvce.edu.in)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to the marketplace? </Text>
        <TouchableOpacity onPress={switchMode} disabled={loading}>
          <Text style={styles.link}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Keeping the exact same styles as before
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50' },
  subHeader: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#7f8c8d' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#7f8c8d', fontSize: 15 },
  link: { color: '#2ecc71', fontSize: 15, fontWeight: 'bold' }
});