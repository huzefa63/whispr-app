"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // You can install lucide-react for icons

function PublicNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="w-full bg-[var(--surface)] text-white shadow">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            id="whispr-logo"
            src="/favicon.ico"
            alt="Whispr logo"
            className="w-10 h-10 rounded-lg bg-gray-800 p-1"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Whispr</h1>
            <p className="text-xs text-gray-400">Private, fast & simple chat</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/home"
            className={`${
              pathname.includes("home") ? "bg-[var(--background)]" : ""
            } text-sm px-3 py-2 rounded-md hover:bg-gray-800`}
          >
            Home
          </Link>
          <Link
            href="/features"
            className={`${
              pathname.includes("features") ? "bg-[var(--background)]" : ""
            } text-sm px-3 py-2 rounded-md hover:bg-gray-800`}
          >
            Features
          </Link>
          <Link
            href="/auth/signin"
            className={`${
              pathname.includes("auth") ? "bg-[var(--background)]" : ""
            } text-sm px-3 py-2 rounded-md hover:bg-gray-800`}
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="ml-2 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 font-medium"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden px-2 bg-[var(--surface)] py-4 space-y-3">
          <Link
            href="/home"
            className={`${
              pathname === '/home' ? "bg-[var(--background)]" : ""
            } block px-6 text-sm py-2 hover:bg-gray-700 rounded-md`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/features"
            className={`${
              pathname.includes("features") ? "bg-[var(--background)]" : ""
            } block px-6 text-sm py-2 hover:bg-gray-700 rounded-md`}
            onClick={() => setMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/auth/signin"
            className={`${
              pathname.includes("auth") ? "bg-[var(--background)]" : ""
            } block px-6 text-sm py-2 hover:bg-gray-700 rounded-md`}
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
          {/* <button className="w-full px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 font-medium">
            Get Started
          </button> */}
        </div>
      )}
    </header>
  );
}

export default PublicNav;
