/** @format */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBm9bQuAefBtF8lARJIZfjVXNyfsCY0Q4",
  authDomain: "calimero-app.firebaseapp.com",
  projectId: "calimero-app",
  storageBucket: "calimero-app.appspot.com",
  messagingSenderId: "905765404715",
  appId: "1:905765404715:web:19dc61b0a1e03faebb2a6e",
  measurementId: "G-RP23VK0NLL"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// export const messaging = getMessaging(app);
// const analytics = getAnalytics(app);

export default app;
