import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserSession = {
  user: User | null;
};

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export async function getUserSession(): Promise<UserSession | null> {
  try {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve({ user });
      });
    });
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Authorization
// ---------------------------------------------------------------------------

export async function checkAuthtozition(privilege: string): Promise<boolean> {
  try {
    const user = await new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });

    if (!user) return false;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) return false;

    const role: string = userDoc.data()?.role ?? "";
    return role === privilege;
  } catch (error) {
    console.error(error as Error);
    return false;
  }
}


// ---------------------------------------------------------------------------
// OAuth — Google
// ---------------------------------------------------------------------------

export async function signInWithAuth() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const { user } = result;

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      createdAt: new Date(),
      ...(!userDoc.exists() && { role: "client" }),  // only set role if new user
    }, { merge: true });

    return { user };
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Email / password
// ---------------------------------------------------------------------------

export async function signInWithEmail(email: string, password: string) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return { user };
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(user, { displayName: name });

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      role: "client",
      createdAt: new Date(),
    });

    return { user };
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export async function sendOTP(
  email: string,
  _type: "forget-password" = "forget-password"
) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { email };
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

export async function resetPassword(
  _email: string,
  otp: string,
  password: string
) {
  try {
    await confirmPasswordReset(auth, otp, password);
    return { success: true };
  } catch (error) {
    console.error("Password reset failed:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error(error);
    return null;
  }
}