import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Prevent re-initialisation in hot-reload environments
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MetaData {
  // ⚠️  Firestore document IDs are strings, not numbers.
  //     Update any interface that depends on `id: number` (e.g. Booking, BookingClientData).
  id: string;
  created_at: string; // stored as ISO string; use serverTimestamp() on write if preferred
}

export interface UserSession {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    emailVerified: boolean;
    // Roles are stored as Firebase custom claims — set them server-side via Admin SDK.
    // Read them client-side with getIdTokenResult().
    role?: string | null;
  };
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/** Returns the current session, or null if not signed in. */
export async function getUserSession(): Promise<UserSession | null> {
  return new Promise((resolve) => {
    // onAuthStateChanged fires once immediately with the current state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) return resolve(null);

      // Custom claims (e.g. { role: "admin" }) must be set via Firebase Admin SDK on your backend.
      const tokenResult = await user.getIdTokenResult();

      resolve({
        user: {
          id:            user.uid,
          email:         user.email,
          name:          user.displayName,
          image:         user.photoURL,
          emailVerified: user.emailVerified,
          role:          (tokenResult.claims["role"] as string) ?? null,
        },
      });
    });
  });
}

/** Returns true if the current user has the given role (via custom claim). */
export async function checkAuthtozition(privilege: string): Promise<boolean> {
  try {
    const session = await getUserSession();
    return session?.user.role === privilege;
  } catch {
    return false;
  }
}

/** Google OAuth pop-up sign-in. */
export async function signInWithAuth(): Promise<UserSession | null> {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
    return getUserSession();
  } catch (error) {
    console.error(error);
    return null;
  }
}

/** Email + password sign-in. */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserSession | null> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return getUserSession();
  } catch (error) {
    console.error(error);
    return null;
  }
}

/** Email + password sign-up. */
export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<UserSession | null> {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    return getUserSession();
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Sends a password-reset email (Firebase handles the OTP internally).
 * ⚠️  The separate `otp` step from NeonDB is gone — Firebase emails a link
 *     that contains an `actionCode`; pass that code to `resetPassword()` below.
 */
export async function sendOTP(email: string): Promise<boolean | null> {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Confirms the password reset.
 * @param actionCode  The code extracted from the Firebase reset-password link
 *                    (e.g. from `new URL(window.location.href).searchParams.get("oobCode")`)
 */
export async function resetPassword(
  _email: string,       // no longer needed by Firebase; kept for API compatibility
  actionCode: string,   // previously `otp` — pass the oobCode from the email link
  newPassword: string
): Promise<boolean | null> {
  try {
    await confirmPasswordReset(auth, actionCode, newPassword);
    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error(error);
  }
}