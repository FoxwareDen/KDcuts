import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <>
      <header className="p-4 flex gap-5 w-full items-center">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </header>
    </>
  );
}
