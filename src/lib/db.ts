import { createClient } from "@neondatabase/neon-js";

export const client = createClient({
  auth: {
    url: import.meta.env.VITE_DATABASE_AUTH_URL,
    allowAnonymous: true
  },
  dataApi: {
    url: import.meta.env.VITE_DATABASE_API_URL
  }
})

export type UserSession = {
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    banned: boolean | null | undefined;
    role?: string | null | undefined;
    banReason?: string | null | undefined;
    banExpires?: Date | null | undefined;
  };
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
    impersonatedBy?: string | null | undefined;
    activeOrganizationId?: string | null | undefined;
  };
};

export async function getUserSession(): Promise<UserSession | null> {
  try {
    const { error, data: userSession } = await client.auth.getSession();

    if (error) throw error;

    return userSession;
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

export async function checkAuthtozition(privilege: string): Promise<boolean> {
  try {
    const data = await getUserSession();

    if (data && data.user.role === privilege) {
      return true;
    }

    return false;
  } catch (error) {
    console.error(error as Error);
    return false;
  }
}

export async function signInWithAuth() {
  try {
    const { error } = await client.auth.signIn.social({
      provider: "google",
      callbackURL: window.location.origin,
    })

    if (error) throw error;

    const userSession = await getUserSession();

    return userSession;
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await client.auth.signIn.email({ email, password });
    if (error) throw error;

    const userSession = await getUserSession();

    if (!userSession) throw new Error("User session not found");

    return data;
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  try {
    const { data, error } = await client.auth.signUp.email({
      email, name, password,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

export async function sendOTP(email: string, type: "forget-password" = "forget-password") {
  try {
    const { data, error } = await client.auth.emailOtp.sendVerificationOtp({
      email,
      type
    })

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

export async function resetPassword(email: string, otp: string, password: string) {
  try {
    const { data, error } = await client.auth.emailOtp.resetPassword({
      email,
      otp,
      password
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("OTP verification failed:", error);
    return null;
  }
}

export async function signOut() {
  try {
    await client.auth.signOut();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export interface MetaData {
  id: number,
  created_at: string,
}
