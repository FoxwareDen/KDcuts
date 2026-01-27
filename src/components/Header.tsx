import { getUserSession, signInWithAuth } from "@/lib/db";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";

export default function Header() {

  const login = () => {
    // TODO: add your own auth logic
    alert("TODO: add your own auth logic")

    signInWithAuth();
  }

  useEffect(() => {
    (async () => {
      const session = await getUserSession();

      console.log(session);
    })()
  }, [])

  return (
    <>
      <header className="p-4 flex w-full items-center justify-between mx-auto max-w-7xl">
        <div className="flex gap-5">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>

        <div className="flex gap-5">
          <button onClick={login}>Login</button>
        </div>
      </header>
    </>
  );
}
