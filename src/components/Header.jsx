import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-4">
        <Link to="/" className="inline-flex items-center">
          <img
            src="/logo-roomie.svg"
            alt="Roomie logo"
            className="h-12 w-auto sm:h-14 md:h-16"
          />
        </Link>
      </div>
    </header>
  );
}

export default Header;
