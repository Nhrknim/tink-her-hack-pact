import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "pact-app-a540a.firebaseapp.com",
  projectId: "pact-app-a540a",
  storageBucket: "pact-app-a540a.firebasestorage.app",
  messagingSenderId: "689394904418",
  appId: "1:689394904418:web:fe50e911fab88812f2d03b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
