import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyCCDdHW_cgfodkVm31RKTvlwOX_DzQRiYY",
  authDomain: "spotify-goth.firebaseapp.com",
  projectId: "spotify-goth",
  storageBucket: "spotify-goth.firebasestorage.app",
  messagingSenderId: "1031182880523",
  appId: "1:1031182880523:web:8c53a7060497c7eb371c0e",
  measurementId: "G-J2PQSYMF9X"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);