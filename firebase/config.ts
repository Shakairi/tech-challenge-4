// Import the functions you need from the SDKs you need
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKhRKx641BNGlim9jdqtqbSdILO3GiLbU",
  authDomain: "tech-challenge-3-9f1ee.firebaseapp.com",
  projectId: "tech-challenge-3-9f1ee",
  storageBucket: "tech-challenge-3-9f1ee.firebasestorage.app",
  messagingSenderId: "855400261531",
  appId: "1:855400261531:web:c0e93d5da639ca250da33e",
  measurementId: "G-LNYKPCEQ07",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  const initApp = initializeApp(firebaseConfig);
  app = initApp;
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
