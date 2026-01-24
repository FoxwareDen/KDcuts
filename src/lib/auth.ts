import { create } from "zustand";
import { redirect } from "@tanstack/react-router";

export type PermType = "user" | "admin" | "moderator";

export async function login() {
  // TODO: add your own auth logic

  setAuthSession({
    isAuthenticated: true,
    user: {
      privilege: "user"
    }
  })
}

export async function logout() {
  // TODO: add your own auth logic

  setAuthSession({
    isAuthenticated: false,
    user: null
  })
}

export async function checkAuthtozition(privilege: PermType) {
  const { user } = getAuthSession();

  if (!user) {
    return redirect({
      href: "/login",
      search: {
        redirect: location.href,
      },
    });
  }

  if (privilege != user.privilege) {
    return redirect({
      href: "/unauthorized",
    });
  }
}

export interface UserSession {
  privilege: PermType;
}

export interface AuthSession {
  user: UserSession | null;
  isAuthenticated: boolean;
}

export interface AuthSessionActions {
  setSession: (session: UserSession) => void;
  clearSession: () => void;
}

type boop = AuthSession & AuthSessionActions;

export const useAuthSession = create<boop>()((set) => ({
  user: null,
  isAuthenticated: false,

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
