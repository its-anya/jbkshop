import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeLinkStyle = {
    color: '#ec4899',
    fontWeight: '600',
  };

  const navLinkClass = "block py-2 text-gray-700 hover:text-pink-500 transition-colors";

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-12 h-12 rounded-full bg-pink-400 flex items-center justify-center text-white font-bold text-xs p-1 text-center font-serif">
            JbK
          </div>
          <span className="text-xl font-serif font-bold text-pink-500">Jewels by Khadijah</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className="text-gray-600 hover:text-pink-500 transition-colors font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Shop</NavLink>
          <NavLink to="/track-order" className="text-gray-600 hover:text-pink-500 transition-colors font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Track Order</NavLink>
          <NavLink to="/admin" className="text-gray-600 hover:text-pink-500 transition-colors font-medium" style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Admin</NavLink>
          <NavLink to="/cart" className="relative text-gray-600 hover:text-pink-500 transition-colors" style={({ isActive }) => isActive ? activeLinkStyle : undefined }>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </NavLink>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
           <Link to="/cart" className="relative text-gray-600 hover:text-pink-500 transition-colors mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="outline-none mobile-menu-button">
            <svg className="w-6 h-6 text-gray-600 hover:text-pink-500"
              x-show="!showMenu"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white`}>
        <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Shop</NavLink>
            <NavLink to="/track-order" onClick={() => setIsMenuOpen(false)} className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Track Order</NavLink>
            <NavLink to="/admin" onClick={() => setIsMenuOpen(false)} className={navLinkClass} style={({ isActive }) => isActive ? activeLinkStyle : undefined }>Admin</NavLink>
        </div>
      </div>
    </header>
  );
};

export default Header;