# 🎓 Campus Marketplace

A secure, peer-to-peer mobile marketplace built exclusively for university students. This app allows students to buy, sell, and negotiate items within their campus network safely, utilizing college-domain email verification and frictionless UPI payments.

## ✨ Key Features

*   **🔒 Exclusive Access:** Strict registration flow requiring a verified university email domain (e.g., `@rvce.edu.in`) and a unique University Seat Number (USN).
*   **🤝 Real-Time Negotiation Engine:** A dynamic, turn-based negotiation system where buyers and sellers can send counter-offers until a price is agreed upon.
*   **💸 Frictionless UPI Payments:** Integrated UPI deep-linking allows buyers to pay sellers directly through their installed banking apps (Bhim, Navi, GPay etc.) without the app storing sensitive financial data.
*   **🔄 Escrow-Style Status Tracking:** Items follow a strict state-machine lifecycle: `OPEN` ➔ `NEGOTIATING` ➔ `RESERVED` ➔ `PAYMENT_SENT` ➔ `COMPLETED`.
*   **📱 Filtered Feeds:** Users can toggle between the global "Marketplace" feed and a personalized "My Deals" tab to track their active negotiations.

## 🛠️ Technology Stack

*   **Frontend:** React Native (managed by Expo)
*   **Navigation:** React Navigation (Bottom Tabs & Native Stack)
*   **Backend / BaaS:** Google Firebase
*   **Database:** Cloud Firestore (Real-time NoSQL)
*   **Authentication:** Firebase Auth (Email Verification & Session Management)

## 📂 Project Structure

```text
├── App.js                   # Navigation config and Auth state gatekeeper
├── MarketplaceContext.js    # Global state management and Firebase listener
├── firebase.js              # Firebase configuration and initialization
├── screens/
│   ├── LoginScreen.js       # User login
│   ├── SignUpScreen.js      # Registration with USN and Domain validation
│   ├── FeedScreen.js        # Main marketplace feed & negotiation engine
│   ├── AddItemScreen.js     # Form to list new products
│   └── ProfileScreen.js     # User details and logout logic
```

🚀 Installation & Local Setup
Prerequisites
• Node.js installed
• Expo CLI installed (npm install -g expo-cli)
• Expo Go app installed on your physical mobile device (iOS/Android)
1. Clone the repository
```
git clone [https://github.com/YashasJKumar/CampusMarketplace.git](https://github.com/YashasJKumar/CampusMarketplace.git)
cd CampusMarketplace
```


2. Install dependencies
```
npm install
```

3. Firebase Configuration : 
You need to connect the app to your own Firebase project.
      * Create a project on Firebase Console.
      * Enable Authentication (Email/Password).
      * Enable Firestore Database and set up the following basic security rules for testing:
      ```
      rules_version = '2';
      service cloud.firestore {
      match /databases/{database}/documents {
         match /{document=**} {
            allow read: if true; 
            allow write: if request.auth != null;
         }
      }
      }
      ```

4. Create a file named firebase.js in the root directory and add your Firebase config:
```
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

4. Run the application
```
npx expo start
```

Scan the generated QR code using the Expo Go app on your mobile device to view and test the application in real-time.

# 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

# 📝 License
This project is MIT licensed.