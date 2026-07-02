import { initializeApp } from "firebase/app";
// Notice we changed how we import Auth here
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDgBGogdNp8m3_IMwlEWRf9qbSTbch6FYo",
  authDomain: "campusmarketplace-8e435.firebaseapp.com",
  projectId: "campusmarketplace-8e435",
  storageBucket: "campusmarketplace-8e435.firebasestorage.app",
  messagingSenderId: "55059145465",
  appId: "1:55059145465:web:6b90443e16e33c53c4b828",
  measurementId: "G-4EGPVN6NY6"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage so users stay logged in
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);