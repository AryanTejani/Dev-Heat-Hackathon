import React, { useState, useEffect, useContext } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './button';
import { UserContext } from '../context/user.context';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useContext(UserContext);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleSignUp = () => {
    window.location.href = '/register';
  };

  // If user is logged in and we're not already on the home page, redirect to /home
  useEffect(() => {
    if (user && window.location.pathname === '/') {
      window.location.href = '/home';
    }
  }, [user]);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm' : 'py-6'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a href={user ? "/home" : "/"} className="text-2xl font-bold gradient-text">TechnoSenpai</a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href={user ? "/home" : "/"} className="text-gray-700 hover:text-purple-600 transition-colors">Home</a>
            <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors">Features</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Pricing</a>
            
            {user ? (
              <>
                <span className="text-gray-700">Hello, {user.name || user.email}</span>
                <Button variant="outline" onClick={handleLogout} className="ml-2">Logout</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleLogin} className="ml-2">Login</Button>
                <Button onClick={handleSignUp}>Sign Up</Button>
              </>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 py-4 bg-white rounded-lg shadow-lg animate-fade-in">
            <div className="flex flex-col space-y-4 px-4">
              <a href={user ? "/home" : "/"} className="text-gray-700 hover:text-purple-600 transition-colors py-2">Home</a>
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors py-2">Features</a>
              <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors py-2">Pricing</a>
              
              <div className="flex flex-col space-y-2 pt-2">
                {user ? (
                  <>
                    <span className="text-gray-700 py-2">Hello, {user.name || user.email}</span>
                    <Button variant="outline" onClick={handleLogout} className="w-full">Logout</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleLogin} className="w-full">Login</Button>
                    <Button onClick={handleSignUp} className="w-full">Sign Up</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
