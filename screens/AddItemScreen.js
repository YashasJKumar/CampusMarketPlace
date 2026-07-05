import { useContext, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { MarketplaceContext } from '../MarketplaceContext';

// Import Firebase tools (No storage needed anymore!)
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function AddItemScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useContext(MarketplaceContext);

  const handleList = async () => {
    if (!title || !description || !price) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    setLoading(true);

    try {
      // Save directly to Database
      await addDoc(collection(db, 'items'), {
        title: title,
        description: description,
        price: `₹${price}`,
        sellerName: currentUser.name,
        sellerEmail: currentUser.email,
        usn: currentUser.usn,
        branch: currentUser.branch,
        isReserved: false,
        createdAt: serverTimestamp(),
        status: 'OPEN',
        currentPrice: `₹${price}`,
        lastActor: 'SELLER',
        sellerUpi: currentUser.upiId
      });

      // Clear the form
      setTitle('');
      setDescription('');
      setPrice('');

      Alert.alert("Success!", `${title} has been listed!`);
      navigation.navigate('Campus Marketplace'); 

    } catch (error) {
      Alert.alert("Upload Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>List a New Item</Text>

      <Text style={styles.sectionTitle}>Item Details</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Item Name (e.g., Engineering Drawing Board)" 
        value={title} 
        onChangeText={setTitle} 
        editable={!loading} 
      />
      
      <TextInput 
        style={[styles.input, styles.textArea]} 
        placeholder="Description (e.g., Barely used, comes with clips and drafter)" 
        value={description} 
        onChangeText={setDescription} 
        editable={!loading}
        multiline={true}
        numberOfLines={3}
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Price in INR (e.g., 500)" 
        value={price} 
        onChangeText={setPrice} 
        keyboardType="numeric" 
        editable={!loading} 
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleList} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Post Item</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#7f8c8d', marginBottom: 10, marginTop: 5 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  textArea: { height: 100, textAlignVertical: 'top' }, // Keeps text starting at the top of the box
  submitButton: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});