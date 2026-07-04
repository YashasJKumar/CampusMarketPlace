import { MarketplaceContext } from '../MarketplaceContext.js'; 
import { db } from '../firebase.js';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  Linking 
} from 'react-native';

export default function FeedScreen() {
  const { currentUser } = useContext(MarketplaceContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offerInput, setOfferInput] = useState({});
  const [viewMode, setViewMode] = useState('feed'); 

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAction = async (item, action, newPrice = null) => {
    const itemRef = doc(db, 'items', item.id);
    const updates = {};

    if (action === 'RESERVE') {
      updates.status = 'RESERVED';
      if (!item.buyerEmail) {
        updates.buyerName = currentUser.name;
        updates.buyerEmail = currentUser.email;
      }
    } else if (action === 'OFFER') {
      if (!newPrice || isNaN(newPrice)) {
        Alert.alert("Invalid Input", "Please enter a valid amount.");
        return;
      }
      updates.status = 'NEGOTIATING';
      updates.currentPrice = `₹${newPrice}`;
      updates.lastActor = currentUser.email;
      
      if (!item.buyerEmail && currentUser.email !== item.sellerEmail) {
        updates.buyerName = currentUser.name;
        updates.buyerEmail = currentUser.email;
      }
    } else if (action === 'MARK_PAID') {
      updates.status = 'PAYMENT_SENT';
    } else if (action === 'CONFIRM_PAYMENT') {
      updates.status = 'COMPLETED';
    }

    try {
      await updateDoc(itemRef, updates);
      if (action !== 'MARK_PAID' && action !== 'CONFIRM_PAYMENT') {
         Alert.alert("Success", "Update sent!");
      }
    } catch (error) {
      Alert.alert("Error", "Could not update item.");
    }
  };

  const handlePay = (sellerUpi, amount) => {
    const cleanAmount = amount ? amount.replace('₹', '') : '0'; 
    const url = `upi://pay?pa=${sellerUpi}&pn=Seller&am=${cleanAmount}&cu=INR`;

    Linking.openURL(url).catch(() => 
      Alert.alert("Error", "No UPI app found on this device to complete the payment.")
    );
  };

  const visibleItems = items.filter(item => {
    if (viewMode === 'feed') {
      if (item.sellerEmail === currentUser.email) return false;
      if (item.status === 'RESERVED' || item.status === 'SOLD' || item.status === 'PAYMENT_SENT' || item.status === 'COMPLETED') return false;
      return true;
    } else {
      return item.sellerEmail === currentUser.email || item.buyerEmail === currentUser.email;
    }
  });

  const renderItem = ({ item }) => {
    const isMyItem = item.sellerEmail === currentUser.email;
    const isWaitingForMe = item.lastActor !== currentUser.email;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.priceTag}>{item.currentPrice}</Text>
        </View>

        <Text style={styles.desc}>{item.description}</Text>

        <View style={styles.sellerDetails}>
          <Text style={styles.label}>Seller: <Text style={styles.info}>{item.sellerName}</Text></Text>
          <Text style={styles.label}>Branch: <Text style={styles.info}>{item.branch} ({item.usn})</Text></Text>
        </View>

        {/* --- STATE MACHINE UI --- */}
        {item.status === 'COMPLETED' ? (
           <View style={[styles.finalBox, { borderColor: '#2ecc71', backgroundColor: '#eaffea' }]}>
             <Text style={styles.successText}>✓ Deal Completed & Verified</Text>
             <Text style={styles.dealInfo}>
               {isMyItem ? `Sold to: ${item.buyerName}` : `Bought from: ${item.sellerName}`}
             </Text>
           </View>
        ) : 

        item.status === 'PAYMENT_SENT' ? (
          <View style={styles.finalBox}>
            <Text style={[styles.successText, { color: '#f39c12' }]}>Payment Processing</Text>
            <Text style={styles.dealInfo}>
              {isMyItem ? `Sold to: ${item.buyerName}` : `Bought from: ${item.sellerName}`}
            </Text>

            {isMyItem ? (
              <View>
                <Text style={styles.statusText}>Buyer claims to have paid. Check your bank app.</Text>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnSuccess, { marginTop: 10 }]} 
                  onPress={() => handleAction(item, 'CONFIRM_PAYMENT')}
                >
                  <Text style={styles.btnText}>Mark Payment Received</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.statusText}>Waiting for the seller to verify your payment...</Text>
            )}
          </View>
        ) : 

        item.status === 'RESERVED' || item.status === 'SOLD' ? (
          <View style={styles.finalBox}>
            <Text style={styles.successText}>✓ Deal Finalized</Text>
            <Text style={styles.dealInfo}>
              {isMyItem ? `Sold to: ${item.buyerName}` : `Bought from: ${item.sellerName}`}
            </Text>

            {!isMyItem ? (
              <View>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnPay]} 
                  onPress={() => handlePay(item.sellerUpi, item.currentPrice)}
                >
                  <Text style={styles.btnText}>Pay Seller via UPI</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnSuccess, { marginTop: 10 }]} 
                  onPress={() => handleAction(item, 'MARK_PAID')}
                >
                  <Text style={styles.btnText}>Mark as Paid</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.statusText}>Waiting for buyer to complete payment...</Text>
            )}
          </View>
        ) : 
        
        item.status === 'NEGOTIATING' ? (
          <View>
            {isWaitingForMe ? (
              <View>
                <Text style={styles.statusText}>New offer received: {item.currentPrice}</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter counter offer (₹)" 
                  keyboardType="numeric" 
                  onChangeText={(v) => setOfferInput({...offerInput, [item.id]: v})} 
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.btn, styles.btnRes]} onPress={() => handleAction(item, 'RESERVE')}>
                    <Text style={styles.btnText}>Accept & Finalize</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnNeg]} onPress={() => handleAction(item, 'OFFER', offerInput[item.id])}>
                    <Text style={styles.btnText}>Counter Offer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.statusText}>Waiting for the other party to respond...</Text>
            )}
          </View>
        ) : 

        (
          <View>
            {isMyItem ? (
              <Text style={styles.statusText}>Waiting for buyers...</Text>
            ) : (
              <View>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter offer amount (₹)" 
                  keyboardType="numeric" 
                  onChangeText={(v) => setOfferInput({...offerInput, [item.id]: v})} 
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.btn, styles.btnNeg]} onPress={() => handleAction(item, 'OFFER', offerInput[item.id])}>
                    <Text style={styles.btnText}>Send Offer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnRes]} onPress={() => handleAction(item, 'RESERVE')}>
                    <Text style={styles.btnText}>Buy Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#3498db" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'feed' && styles.activeToggle]} 
          onPress={() => setViewMode('feed')}
        >
          <Text style={viewMode === 'feed' ? styles.activeToggleText : styles.toggleText}>Marketplace</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'myDeals' && styles.activeToggle]} 
          onPress={() => setViewMode('myDeals')}
        >
          <Text style={viewMode === 'myDeals' ? styles.activeToggleText : styles.toggleText}>My Deals</Text>
        </TouchableOpacity>
      </View>

      <FlatList 
        data={visibleItems} 
        renderItem={renderItem} 
        keyExtractor={i => i.id} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  toggleContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', elevation: 2, marginBottom: 10 },
  toggleBtn: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8 },
  activeToggle: { backgroundColor: '#3498db' },
  toggleText: { color: '#777', fontWeight: 'bold' },
  activeToggleText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginHorizontal: 10, marginBottom: 15, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: 'bold' },
  priceTag: { fontSize: 20, color: '#2ecc71', fontWeight: 'bold' },
  desc: { fontSize: 15, color: '#444', marginBottom: 12 },
  sellerDetails: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 12 },
  label: { fontSize: 13, color: '#777' },
  info: { fontWeight: '600', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 10, backgroundColor: '#fff' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnNeg: { backgroundColor: '#f39c12' },
  btnRes: { backgroundColor: '#3498db' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  finalBox: { backgroundColor: '#e8f8f5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#27ae60' },
  successText: { color: '#27ae60', fontWeight: 'bold', marginBottom: 5 },
  dealInfo: { color: '#2c3e50', fontSize: 15, marginBottom: 5 },
  statusText: { color: '#e67e22', fontStyle: 'italic', marginBottom: 8, fontWeight: '500' },
  btnPay: { backgroundColor: '#8e44ad', marginTop: 10 }, 
  btnSuccess: { backgroundColor: '#27ae60' }
});