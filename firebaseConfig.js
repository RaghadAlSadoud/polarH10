import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
import {getAuth} from "firebase/auth";
//import {...} from "firebase/database";
import {getFirestore} from "firebase/firestore";
//import {...} from "firebase/functions";
//import {...} from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDL-gazoPlGJ0vgiGGsFl7h81U8-k1xi4E",
    authDomain: "polarh10.firebaseapp.com",
    projectId: "polarh10",
    storageBucket: "polarh10.appspot.com",
    messagingSenderId: "743870831356",
    appId: "1:743870831356:web:dc0c0648aa0386b7089579"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const getAuthState = () => useAuthState(auth);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase