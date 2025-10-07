'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from './icons';

interface HamburgerMenuProps {
  currentPath?: string;
}

export function HamburgerMenu({ currentPath }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navItems = [
    { href: '/fi/nettopalkka-laskuri', label: 'Nettopalkka Laskuri', shortLabel: 'Nettopalkka' },
    { href: '/fi/verolaskuri', label: 'Vero Laskuri', shortLabel: 'Vero' },
    { href: '/fi/kaikki-kunnat', label: 'Kaikki Kunnat', shortLabel: 'Kunnat' },
  ];

  const isActive = (href: string) => {
    return currentPath === href || currentPath?.startsWith(href);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Avaa valikko"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-700" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={closeMenu}
            style={{ zIndex: 9998 }}
          />
          
          {/* Menu Panel */}
          <div 
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            style={{ zIndex: 9999 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Link 
                  href="/" 
                  className="text-lg font-bold text-primary-800"
                  onClick={closeMenu}
                >
                  Nettopalkka.fi
                </Link>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Sulje valikko"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-4 py-6 overflow-y-auto">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors duration-200 ${
                          isActive(item.href)
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="text-sm text-gray-500 text-center">
                  <p>© 2025 Nettopalkka.fi</p>
                  <p className="mt-1">Suomen luotettavin laskuri</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
