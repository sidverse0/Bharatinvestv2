
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBc7b0dCD9rvwEA-7c2W7rbCeg9OIVMToc",
  authDomain: "bharatinvest-63e26.firebaseapp.com",
  projectId: "bharatinvest-63e26",
  storageBucket: "bharatinvest-63e26.storage.app",
  messagingSenderId: "184532982571",
  appId: "1:184532982571:web:78812c9d1a1f36ffae836e"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
