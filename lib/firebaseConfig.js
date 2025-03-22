// lib/firebaseConfig.js
// import { initializeApp } from "firebase/app";


// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID",
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// export { db };
  
  
  
  
  // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjt-nzeeVweMznG6IeEOf2jYqEY-9tDug",
  authDomain: "maneger-app-185dd.firebaseapp.com",
  projectId: "maneger-app-185dd",
  storageBucket: "maneger-app-185dd.firebasestorage.app",
  messagingSenderId: "781935558350",
  appId: "1:781935558350:web:be72cf9f5ffeb71b66da9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
