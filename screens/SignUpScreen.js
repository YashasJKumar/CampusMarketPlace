import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../firebase.js'; // Ensure the .js extension is there
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function SignUpScreen({ switchMode }) {
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [branch, setBranch] = useState('');
  const [upiId, setUpiId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // 1. Basic Validation
    if (!name || !usn || !branch || !email || !password) {
      Alert.alert("Missing Fields", "Please fill out all the fields.");
      return;
    }
    
    if (!upiId.includes('@')) {
      Alert.alert("Invalid UPI ID", "Please enter a valid UPI ID.");
      return;
    }

    // 2. Domain Restriction
    const domain = "@rvce.edu.in";
    if (!email.trim().toLowerCase().endsWith(domain)) {
      Alert.alert(
        "Invalid Email", 
        `You must use a valid college email ending with ${domain} to join the Campus Marketplace.`
      );
      return;
    }

    setLoading(true);
    try {
      const formattedUSN = usn.toUpperCase().trim();

      console.log("Searching Database for USN:", formattedUSN);

      // ⭐️ NEW: CHECK IF USN ALREADY EXISTS ⭐️
      const usersRef = collection(db, "users");
      const usnQuery = query(usersRef, where("usn", "==", formattedUSN));
      const querySnapshot = await getDocs(usnQuery);
      console.log("Number of matching USNs found:", querySnapshot.size);

      if (!querySnapshot.empty) {
        // If the snapshot is not empty, it means this USN is already in the database
        Alert.alert("Account Exists", `An account with the USN ${formattedUSN} is already registered.`);
        setLoading(false);
        return; // Stop the sign-up process entirely
      }
      // else{
      //   Alert.alert("Debug", `Firestore checked for ${formattedUSN} but found 0 matches. Creating account...`);
      // }

      // 3. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 4. Send the verification email
      await sendEmailVerification(userCredential.user);
      
      // 5. Save all details to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email: email.trim().toLowerCase(),
        usn: formattedUSN,
        branch,
        upiId
      });
      
      Alert.alert(
        "Verification Sent!", 
        "Please check your university email inbox and click the link to verify your account."
      );
      
    } catch (error) {
      // ⭐️ NEW: CATCH DUPLICATE EMAIL ERROR ⭐️
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("Email in Use", "An account with this email already exists. Please switch to the Login screen.");
      } else {
        Alert.alert("Sign Up Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* App Title and Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>Campus Marketplace</Text>
          <Text style={styles.subtitle}>Create your student account</Text>
        </View>

        {/* Input Fields with Hints (Placeholders) */}
        <TextInput 
          style={styles.input} 
          placeholder="Full Name (e.g., John Doe)" 
          value={name} 
          onChangeText={setName} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="USN (e.g., 1RV21CS001)" 
          value={usn} 
          onChangeText={setUsn} 
          autoCapitalize="characters"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Branch (e.g., CSE, ECE)" 
          value={branch} 
          onChangeText={setBranch} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="UPI ID for payments (name@bank)" 
          value={upiId} 
          onChangeText={setUpiId} 
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="University Email Address @rvce.edu.in" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password (minimum 6 characters)" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />
        
        {/* Sign Up Button */}
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Creating Account..." : "Sign Up"}</Text>
        </TouchableOpacity>

        {/* Switch to Login Link */}
        <TouchableOpacity style={styles.switchButton} onPress={switchMode}>
          <Text style={styles.switchText}>Already have an account? <Text style={styles.linkText}>Log in here</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 15,
    color: '#7f8c8d',
  },
  linkText: {
    color: '#3498db',
    fontWeight: 'bold',
  }
});