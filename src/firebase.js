// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBqRrokqEnxS-wytg4QlSm0MfHXSzymQg8",
  authDomain: "mynotesapp-6703f.firebaseapp.com",
  projectId: "mynotesapp-6703f",
  storageBucket: "mynotesapp-6703f.appspot.com", // ✅ FIXED HERE
  messagingSenderId: "994030545597",
  appId: "1:994030545597:web:b69507051d0f94af4de5d4",
  measurementId: "G-ZBPPJTC2B6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
