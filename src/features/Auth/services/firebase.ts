import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase  } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyB2H2JfWr58bpsYpF2RlM16SugsZF3VnM0",
  authDomain: "authentication-314b9.firebaseapp.com",
  databaseURL: "https://authentication-314b9-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "authentication-314b9",
  storageBucket: "authentication-314b9.firebasestorage.app",
  messagingSenderId: "1000675315972",
  appId: "1:1000675315972:web:3794f51592a12c81634051"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth,db };