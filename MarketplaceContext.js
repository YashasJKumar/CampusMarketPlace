import React, { createContext, useState } from 'react';

export const MarketplaceContext = createContext();

// We will move these items to Firebase in the next step, but let's keep them here for now so the feed doesn't break.
const INITIAL_DATA = [
  { id: '1', title: 'Calculus Early Transcendentals', price: '$40', sellerName: 'Alex T.', sellerEmail: 'alex@rvce.edu.in', usn: '1RV21CS001', branch: 'CSE', image: 'https://via.placeholder.com/150', isReserved: false },
];

export const MarketplaceProvider = ({ children }) => {
  const [items, setItems] = useState(INITIAL_DATA);
  const [currentUser, setCurrentUser] = useState(null);

  // Notice we removed registeredUsers completely!
  return (
    <MarketplaceContext.Provider value={{ items, setItems, currentUser, setCurrentUser }}>
      {children}
    </MarketplaceContext.Provider>
  );
};