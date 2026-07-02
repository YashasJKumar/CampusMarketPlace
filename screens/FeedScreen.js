import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MarketplaceContext } from '../MarketplaceContext';

import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function FeedScreen() {
  const { currentUser } = useContext(MarketplaceContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      }));
      setItems(fetchedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleReserve = async (id, title, sellerEmail) => {
    if (sellerEmail === currentUser.email) {
      Alert.alert("Oops!", "You cannot reserve your own item.");
      return;
    }

    try {
      const itemRef = doc(db, 'items', id);
      await updateDoc(itemRef, { isReserved: true });
      Alert.alert("Item Reserved!", `You have reserved ${title}.`);
    } catch (error) {
      Alert.alert("Error", "Could not reserve item. Please try again.");
    }
  };

  const visibleItems = items.filter(item => {
    if (!item.isReserved) return true; 
    if (item.sellerEmail === currentUser.email) return true; 
    return false;
  });

  const renderItem = ({ item }) => {
    const isMyItem = item.sellerEmail === currentUser.email;

    return (
      <View style={[styles.card, item.isReserved && styles.cardReserved]}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>{item.price}</Text>
        </View>
        
        {/* New Description Field */}
        <Text style={styles.description}>{item.description}</Text>
        
        <View style={styles.sellerInfoContainer}>
          <Text style={styles.seller}>{isMyItem ? "Listed by: You" : `Listed by: ${item.sellerName}`}</Text>
          <Text style={styles.studentInfo}>{item.usn} • {item.branch}</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            item.isReserved ? styles.buttonReserved : (isMyItem ? styles.buttonMine : null)
          ]} 
          onPress={() => handleReserve(item.id, item.title, item.sellerEmail)}
          disabled={item.isReserved || isMyItem}
        >
          <Text style={styles.buttonText}>
            {item.isReserved ? "Reserved (Off Market)" : (isMyItem ? "Your Item" : "Reserve Item")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {visibleItems.length === 0 ? (
        <Text style={{textAlign: 'center', marginTop: 50, color: 'gray'}}>No items available right now.</Text>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  cardReserved: { opacity: 0.7 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  title: { fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 10 },
  price: { fontSize: 18, color: '#2ecc71', fontWeight: 'bold' },
  description: { fontSize: 14, color: '#34495e', marginBottom: 15, fontStyle: 'italic' },
  sellerInfoContainer: { marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  seller: { fontSize: 14, color: '#2c3e50', fontWeight: '500' },
  studentInfo: { fontSize: 12, color: '#7f8c8d', marginTop: 2 }, 
  button: { backgroundColor: '#3498db', padding: 12, borderRadius: 5, alignItems: 'center' },
  buttonMine: { backgroundColor: '#8e44ad' },
  buttonReserved: { backgroundColor: '#e74c3c' }, 
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});