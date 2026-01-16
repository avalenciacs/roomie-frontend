import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="w-full border-b border-slate-200 bg-slate-100">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-center px-4">
        <Link to="/" aria-label="Go to home">
          <img
            src="/logo-roomie.svg"
            alt="Roomie"
            className="h-12 w-auto md:h-14"
          />
        </Link>
      </div>
    </header>
  );
}

export default Header;
