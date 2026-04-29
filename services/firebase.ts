import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Fix: Use Firebase v8 namespaced API for initialization to resolve export errors.
// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize and export Firebase services
export const database = firebase.database();
