import { create } from "zustand";
import { getUserSession } from "@/lib/db";

import { type UserSession } from "./db";

export type PermType = "user" | "admin" | "moderator";

export async function checkAuthtozition(privilege: string) {
  const user = await getUserSession();


  if (!user) {
    console.log("user not found")
    return false;
  }

  if (user?.user && user.user.role == privilege) {
    return true;
  }

  return false;
}

export interface AuthSession {
  user: UserSession | null;
  isAuthenticated: boolean;
  initialized: boolean;
}

export interface AuthSessionActions {
  setSession: (session: UserSession) => void;
  clearSession: () => void;
}

type boop = AuthSession & AuthSessionActions;

export const useAuthSession = create<boop>()((set) => ({
  user: null,
  isAuthenticated: false,
  initialized: false,

  setSession: (session) =>
    set(() => ({
      user: session,
      isAuthenticated: true,
    })),

  clearSession: () =>
    set(() => ({
      user: null,
      isAuthenticated: false,
    })),
}));

export function setAuthSession(data: Partial<AuthSession>) {
  useAuthSession.setState(data)
