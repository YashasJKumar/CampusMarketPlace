import { initializeApp } from "firebase/app";
// Notice we changed how we import Auth here
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

//Firebase config

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage so users stay logged in
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);
