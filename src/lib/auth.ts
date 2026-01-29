import { create } from "zustand";
import { redirect } from "@tanstack/react-router";

import { getUserSession, type UserSession } from "./db";

export type PermType = "user" | "admin" | "moderator";

export async function checkAuthtozition(privilege: string) {
  const { initialized } = getAuthSession();

  if (!initialized) {
    await intializeAuthSession();
  }

  const { user } = getAuthSession();

  if (!user) {
    return redirect({
      href: "/login",
      search: {
        redirect: location.href,
      },
    });
  }

  if (privilege != user.user.role) {
    return redirect({
      href: "/unauthorized",
    });
  }
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
}

export function getAuthSession() {
  return useAuthSession.getState(); // NOT a hook
}

export async function intializeAuthSession() {
  const session = await getUserSession()

  if (session) {
    setAuthSession({ user: session, isAuthenticated: true });
  }

  setAuthSession({ initialized: true });

  return session;
}
