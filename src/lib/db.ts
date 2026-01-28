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

export async function getUserSession(): Promise<any | null> {
  try {
    const { error, data: userSession } = await client.auth.getSession();

    if (error) throw error;

  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

export async function signInWithAuth() {
  try {
    const { data, error } = await client.auth.signIn.social({
      provider: "google",
      callbackURL: window.location.origin,
    })

    if (error) throw error;

  } catch (error) {
    console.error(error as Error);
    return null;
  }
}


export async function signOut() {
  try {
    await client.auth.signOut();
  } catch (error) {
    console.log(error);
    return null;
  }
}

export interface MetaData {
  id: number,
  created_at: string,
}

