// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDl6hu5XphUjrq9o5nI2xhY_JNh2nldHqo",
  authDomain: "wishlist-claude.firebaseapp.com",
  projectId: "wishlist-claude",
  storageBucket: "wishlist-claude.firebasestorage.app",
  messagingSenderId: "967286187536",
  appId: "1:967286187536:web:fd88608c0c8d1802350c95",
  measurementId: "G-75THZHZYXM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);