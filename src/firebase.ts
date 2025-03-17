// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';

// // Replace these placeholder values with your actual Firebase configuration
// // from the Firebase Console (Project Settings > General > Your apps > Web app)
// const firebaseConfig = {
//   apiKey: "REPLACE_WITH_YOUR_API_KEY",
//   authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
//   projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
//   storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
//   messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
//   appId: "REPLACE_WITH_YOUR_APP_ID"
// };
// // 
// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export default app; 

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);