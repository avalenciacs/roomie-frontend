
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { Button } from "./ui/ui";

function Header() {
  const { logout, user } = useContext(AuthContext);

  return (
    <header className="w-full border-b border-slate-200 bg-white">
      {/* Mobile: flex / Desktop: grid */}
      <div
        className="
          mx-auto w-full max-w-6xl
          px-4 py-3
          flex items-center justify-between
          md:grid md:grid-cols-3 md:justify-items-center
        "
      >
        {/* Left spacer (desktop only) */}
        <div className="hidden md:block" />

        {/* Logo = Home (FlatsList) */}
        <Link
          to="/"
          className="inline-flex items-center md:justify-self-center"
          aria-label="Go to My Flats"
        >
          <img
            src="/logo-roomie.svg"
            alt="Roomie"
            className="h-12 w-auto sm:h-14"
          />
        </Link>

        {/* Logout (right) */}
        <div className="justify-self-end">
          {user ? (
            <Button variant="outline" className="px-3 py-2" onClick={logout}>
              Logout
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Header;
