import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MarketplaceContext } from '../MarketplaceContext.js';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.js';

export default function ProfileScreen() {
  const { currentUser, setCurrentUser } = useContext(MarketplaceContext);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clearing the context kicks the user back to the Login screen
      setCurrentUser(null); 
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{currentUser?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{currentUser?.name}</Text>
        <Text style={styles.email}>{currentUser?.email}</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>USN: <Text style={styles.infoValue}>{currentUser?.usn}</Text></Text>
          <Text style={styles.infoLabel}>Branch: <Text style={styles.infoValue}>{currentUser?.branch}</Text></Text>
          <Text style={styles.infoLabel}>UPI ID: <Text style={styles.infoValue}>{currentUser?.upiId}</Text></Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5', alignItems: 'center' },
  profileCard: { 
    backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '100%', 
    alignItems: 'center', elevation: 4, marginBottom: 30, marginTop: 20 
  },
  avatarCircle: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#3498db', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15 
  },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  email: { fontSize: 16, color: '#7f8c8d', marginBottom: 20 },
  infoBox: { width: '100%', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10 },
  infoLabel: { fontSize: 15, color: '#7f8c8d', marginBottom: 8 },
  infoValue: { color: '#2c3e50', fontWeight: 'bold' },
  logoutButton: { 
    backgroundColor: '#e74c3c', width: '100%', padding: 16, 
    borderRadius: 12, alignItems: 'center' 
  },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});