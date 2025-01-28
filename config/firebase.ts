// Import the necessary Firebase modules
import { initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
} from "firebase/auth";
import {
    Timestamp,
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,  // Full Firestore methods (not from lite)
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";  // Use from full Firestore, not lite
import { getStorage } from "firebase/storage";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app
const fireApp = initializeApp(firebaseConfig);

// Initialize Firebase services
const fireDB = getFirestore(fireApp);
const auth = getAuth(fireApp);
const storage = getStorage(fireApp);

// Export Firebase services and utilities for use in your React components
export {
    Timestamp, addDoc, auth,
    collection, createUserWithEmailAndPassword, doc, fireApp,
    fireDB, getDoc,
    getDocs, query, setDoc, signInWithEmailAndPassword, updateDoc, where
};

// Function to transform location name (for example, make it lowercase and replace spaces with underscores)
function transformLocationName(location: string): string {
  return location.toLowerCase().replace(/\s+/g, "_");
}

// Update prompt in Firestore database
export async function updatePromptInDatabase(docId: string, prompt1: string, prompt2: string) {
    try {
        const docRef = doc(fireDB, "prompts", docId); // Reference to the specific document
        
        // Update the fields
        await updateDoc(docRef, {
            prompt1,
            prompt2,
            updatedAt: new Date(), // Optionally track when the document was updated
        });
        
        return `Document with ID ${docId} updated successfully`;
    } catch (error) {
        throw new Error(`Failed to update document with ID ${docId}`);
    }
}

// Fetch prompt from Firestore database
export async function getPromptFromDatabase(docId: string) {
    try {
        const docRef = doc(fireDB, "prompts", docId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error(`No document found with ID ${docId}`);
        }
        return docSnap.data();
    } catch (error) {
        throw new Error(`Failed to fetch document with ID ${docId}`);
    }
}
