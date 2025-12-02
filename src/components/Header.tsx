import { Trophy, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFrontendDetails } from '../context/FrontendDetailsContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { details } = useFrontendDetails();
  const tournamentName = details?.dashboard?.tournamentName ?? 'MPL';
  const seasonLabel = details?.dashboard?.season ?? 'Season 2';
  const seasonYear = details?.dashboard?.seasonYear;
  const headerTitle = `${tournamentName} ${seasonLabel}`.trim();
  const subTitle = seasonYear ? `Season Year ${seasonYear}` : 'Milind Nagar Premier League';

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#041955] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-[#E6B31E]" />
            <div>
              <h1 className="text-2xl font-bold">{headerTitle}</h1>
              <p className="text-xs text-[#E6B31E]">{subTitle}</p>
            </div>
          </Link>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`hover:text-[#E6B31E] transition-colors duration-300 font-medium ${
                isActive('/') ? 'text-[#E6B31E]' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`hover:text-[#E6B31E] transition-colors duration-300 font-medium ${
                isActive('/about') ? 'text-[#E6B31E]' : ''
              }`}
            >
              About
            </Link>
            <Link
              to="/owners"
              className={`hover:text-[#E6B31E] transition-colors duration-300 font-medium ${
                isActive('/owners') ? 'text-[#E6B31E]' : ''
              }`}
            >
              Owners
            </Link>
            <Link
              to="/register"
              className={`hover:text-[#E6B31E] transition-colors duration-300 font-medium ${
                isActive('/register') ? 'text-[#E6B31E]' : ''
              }`}
            >
              Register
            </Link>
            <Link
              to="/search"
              className={`hover:text-[#E6B31E] transition-colors duration-300 font-medium ${
                isActive('/search') ? 'text-[#E6B31E]' : ''
              }`}
            >
              Check Details
            </Link>
          </nav>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-3">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`block w-full text-left py-2 hover:text-[#E6B31E] transition-colors duration-300 ${
                isActive('/') ? 'text-[#E6B31E]' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className={`block w-full text-left py-2 hover:text-[#E6B31E] transition-colors duration-300 ${
                isActive('/about') ? 'text-[#E6B31E]' : ''
              }`}
            >
              About
            </Link>
            <Link
              to="/owners"
              onClick={() => setIsMenuOpen(false)}
              className={`block w-full text-left py-2 hover:text-[#E6B31E] transition-colors duration-300 ${
                isActive('/owners') ? 'text-[#E6B31E]' : ''
              }`}
            >
              Owners
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMenuOpen(false)}
              className={`block w-full text-left py-2 hover:text-[#E6B31E] transition-colors duration-300 ${
                isActive('/register') ? 'text-[#E6B31E]' : ''
              }`}
            >
              Register
            </Link>
            <Link
              to="/search"
              onClick={() => setIsMenuOpen(false)}
              className={`block w-full text-left py-2 hover:text-[#E6B31E] transition-colors duration-300 ${
                isActive('/search') ? 'text-[#E6B31E]' : ''
              }`}
            >
              Check Details
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
