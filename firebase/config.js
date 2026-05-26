import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmyNeuxswwUB1nL3Rj5INL6YudWq4BrxQ",
  authDomain: "medicinski-karton.firebaseapp.com",
  projectId: "medicinski-karton",
  storageBucket: "medicinski-karton.firebasestorage.app",
  messagingSenderId: "621859250630",
  appId: "1:621859250630:web:91ce8615f875da1e3812c7",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const secondaryApp = getApps().some((item) => item.name === "secondary")
  ? getApp("secondary")
  : initializeApp(firebaseConfig, "secondary");

export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);
export const db = getFirestore(app);