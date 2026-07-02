import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { MarketplaceContext } from '../MarketplaceContext';

// Import Firebase tools
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUpScreen({ switchMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(false); // To show a spinner while talking to cloud
  
  const { setCurrentUser } = useContext(MarketplaceContext);

  const handleSignUp = async () => {
    if (!email.toLowerCase().endsWith('@rvce.edu.in')) {
      Alert.alert("Access Denied", "You must use a valid @rvce.edu.in email address.");
      return;
    }
    if (!password || !name || !usn || !branch) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the user securely in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        email: email.toLowerCase(),
        name: name,
        usn: usn.toUpperCase(),
        branch: branch.toUpperCase()
      };

      // 2. Save their extra details (USN, Branch) to Firestore Database
      await setDoc(doc(db, 'users', user.uid), userData);

      // 3. Log them into the app locally
      setCurrentUser(userData);

    } catch (error) {
      // Firebase automatically checks for duplicate emails and weak passwords!
      Alert.alert("Sign Up Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>RVCE Marketplace</Text>
      <Text style={styles.subHeader}>Create an Account</Text>

      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="USN (e.g., 1RV21...)" value={usn} onChangeText={setUsn} autoCapitalize="characters" />
      <TextInput style={styles.input} placeholder="Branch (e.g., CSE)" value={branch} onChangeText={setBranch} autoCapitalize="characters" />
      <TextInput style={styles.input} placeholder="Email (@rvce.edu.in)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password (Min 6 chars)" value={password} onChangeText={setPassword} secureTextEntry />
      
      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={switchMode} disabled={loading}>
          <Text style={styles.link}>Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Keeping the exact same styles as before
const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50' },
  subHeader: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#7f8c8d' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#7f8c8d', fontSize: 15 },
  link: { color: '#3498db', fontSize: 15, fontWeight: 'bold' }
});