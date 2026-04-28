import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1jt4keHEDiu5pQE2ML3dxBPRGk6uTwls",
  authDomain: "final-f9b7e.firebaseapp.com",
  databaseURL: "https://final-f9b7e-default-rtdb.firebaseio.com",
  projectId: "final-f9b7e",
  storageBucket: "final-f9b7e.appspot.com",
  messagingSenderId: "224390321920",
  appId: "1:224390321920:web:2ce1c493620bd0efb045e5",
  measurementId: "G-75XGLPLBHZ"
};

// Fix: Use Firebase v8 namespaced API for initialization to resolve export errors.
// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize and export Firebase services
export const database = firebase.database();