import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="w-full py-6 flex justify-center border-b">
      <Link to="/">
        <img
  src="/logo-roomie.svg"
  alt="Roomie logo"
  className="h-16 w-auto md:h-20 lg:h-24"
/>
      </Link>
    </header>
  );
}

export default Header;
