// import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
// import { Auth, getAuth } from "firebase/auth";
// import { Firestore, getFirestore } from "firebase/firestore";
// import { FirebaseStorage, getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
// };

// let app: FirebaseApp;
// let auth: Auth;
// let db: Firestore;
// let storage: FirebaseStorage;

// if (!getApps().length) {
//   app = initializeApp(firebaseConfig);
//   db = getFirestore(app);
//   storage = getStorage(app);
//   auth = getAuth(app);
// } else {
//   app = getApp();
//   auth = getAuth(app);
//   db = getFirestore(app);
//   storage = getStorage(app);
// }

// export { app, auth, db, storage };

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import {
  Firestore,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);

  // - Cache persistente: dados salvos no disco entre sessões
  // - Leituras repetidas vêm do cache (sem custo no Firebase)
  // - App funciona offline com os dados já carregados
  // - Sincroniza automaticamente quando a conexão voltar
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });

  storage = getStorage(app);
  auth = getAuth(app);
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };