import { Trophy, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-[#041955] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-[#E6B31E]" />
            <div>
              <h1 className="text-2xl font-bold">MPL Season 2</h1>
              <p className="text-xs text-[#E6B31E]">Milind Nagar Premier League</p>
            </div>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('home')}
              className="hover:text-[#E6B31E] transition-colors duration-300 font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('winner')}
              className="hover:text-[#E6B31E] transition-colors duration-300 font-medium"
            >
              Season 1 Winner
            </button>
            <button
              onClick={() => scrollToSection('register')}
              className="hover:text-[#E6B31E] transition-colors duration-300 font-medium"
            >
              Register
            </button>
            <button
              onClick={() => scrollToSection('details-search')}
              className="hover:text-[#E6B31E] transition-colors duration-300 font-medium"
            >
              Check Details
            </button>
          </nav>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-3">
            <button
              onClick={() => scrollToSection('home')}
              className="block w-full text-left py-2 hover:text-[#E6B31E] transition-colors duration-300"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('winner')}
              className="block w-full text-left py-2 hover:text-[#E6B31E] transition-colors duration-300"
            >
              Season 1 Winner
            </button>
            <button
              onClick={() => scrollToSection('register')}
              className="block w-full text-left py-2 hover:text-[#E6B31E] transition-colors duration-300"
            >
              Register
            </button>
            <button
              onClick={() => scrollToSection('details-search')}
              className="block w-full text-left py-2 hover:text-[#E6B31E] transition-colors duration-300"
            >
              Check Details
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
