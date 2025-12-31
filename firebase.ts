// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBt2aTiOehs0VL3ND-61Pney5YbOekTVqI",
    authDomain: "commission-registration.firebaseapp.com",
    projectId: "commission-registration",
    storageBucket: "commission-registration.firebasestorage.app",
    messagingSenderId: "1011761083622",
    appId: "1:1011761083622:web:fb607cd53dc184aa5f3727",
    measurementId: "G-K9PR2LPZM5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
