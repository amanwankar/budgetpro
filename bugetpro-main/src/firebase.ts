import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously, updateProfile, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.warn("Google Login Failed, attempting Anonymous Login as fallback:", error);
    try {
      const anonResult = await signInAnonymously(auth);
      if (anonResult.user && !anonResult.user.displayName) {
        await updateProfile(anonResult.user, {
          displayName: "Guest User",
          photoURL: "https://ui-avatars.com/api/?name=Guest+User&background=6366f1&color=fff"
        });
      }
      return anonResult.user;
    } catch (fallbackError) {
       console.error("Anonymous Login also failed:", fallbackError);
       throw fallbackError;
    }
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    // If user not found, try to create them as a convenience
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const createResult = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(createResult.user, {
          displayName: email.split('@')[0],
          photoURL: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=10b981&color=fff`
        });
        return createResult.user;
      } catch (createError) {
        console.error("Account Creation Error:", createError);
        throw createError;
      }
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};
