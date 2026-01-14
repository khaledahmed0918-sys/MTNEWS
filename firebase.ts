import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, runTransaction, push, set, get, remove } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmyrLbIwf-tfa70Y8XW12aGuG4yg3I44g",
  authDomain: "mtnews3297.firebaseapp.com",
  databaseURL: "https://mtnews3297-default-rtdb.firebaseio.com",
  projectId: "mtnews3297",
  storageBucket: "mtnews3297.appspot.com",
  messagingSenderId: "586255791966",
  appId: "1:586255791966:web:90480be6fcbe16dd2141cf",
  measurementId: "G-KVH6PHKPMZ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, runTransaction, push, set, get, remove };
