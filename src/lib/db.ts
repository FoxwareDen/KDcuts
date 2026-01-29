import { createClient } from "@neondatabase/neon-js";
import { setAuthSession } from "./auth";

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

export async function signInWithAuth() {
  try {
    const { error } = await client.auth.signIn.social({
      provider: "google",
      callbackURL: window.location.origin,
    })

    if (error) throw error;

    const userSession = await getUserSession();

    setAuthSession({ user: userSession, isAuthenticated: true });

    return userSession;
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}


export async function signOut() {
  try {
    await client.auth.signOut();
    setAuthSession({
      user: null,
      isAuthenticated: false
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export interface MetaData {
  id: number,
  created_at: string,
}

