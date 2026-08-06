// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// These must be NEXT_PUBLIC_* : this module runs in the browser, and Next only
// inlines NEXT_PUBLIC_* variables into the client bundle. Without the prefix every
// field below is `undefined` at runtime and Firestore silently talks to
// projects/undefined. Firebase web config is designed to be public; access is
// enforced by Firestore security rules, not by hiding these values.
const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_API_KEY!,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_AUTH_DOMAIN!,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_STORAGE_BUCKET!,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_MESSAGING_SENDER_ID!,
	appId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_APP_ID!,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
export { db };
