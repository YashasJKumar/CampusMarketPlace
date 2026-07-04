import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js'; 

// 1. Create the Context
export const MarketplaceContext = createContext();

// 2. Create the Provider Component
export const MarketplaceProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch additional user details from Firestore
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            // Add emailVerified here
            setCurrentUser({ ...docSnap.data(), uid: user.uid, emailVerified: user.emailVerified }); 
          } else {
            setCurrentUser({ uid: user.uid, email: user.email, emailVerified: user.emailVerified });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser(null);
        }
      } else {
        // User is logged out
        setCurrentUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <MarketplaceContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </MarketplaceContext.Provider>
  );
};