
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdL6HQb8dh3ujwRe-nVhD2GhM_YBUFs7I",
  authDomain: "jbkshop.firebaseapp.com",
  projectId: "jbkshop",
  storageBucket: "jbkshop.firebasestorage.app",
  messagingSenderId: "615116138351",
  appId: "1:615116138351:web:88d6ec11c1df6e4388aa9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
