import React, { useState } from 'react';
import { ActiveView, User } from '../types';
import { GlitchCoreMenu } from './GlitchCoreMenu'; // Import the new menu
import { Button } from './ui/Button';

// Simple Terminal/Code Icon
const TerminalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const MenuTriggerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props} className={`w-8 h-8 transition-all duration-300 ease-in-out group-hover:rotate-[720deg] group-hover:scale-110 ${props.className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25zM3.75 12h16.5M3.75 17.25h16.5M3.75 6.75h16.5" />
  </svg>
);


interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  onLogout: () => void;
  cartItemCount: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeView, 
  setActiveView, 
  isAuthenticated, 
  currentUser, 
  onLogout, 
  cartItemCount 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogoClick = () => {
    if (isMenuOpen) setIsMenuOpen(false);
    setActiveView('landing'); 
  }

  return (
    <>
      <header className="bg-neutral-darkest shadow-md sticky top-0 z-50 border-b-2 border-neutral-dark">
        <div className="container mx-auto px-2 sm:px-4 py-3">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center cursor-pointer group active:scale-95 transition-transform duration-100 ease-in-out" 
              onClick={handleLogoClick}
              aria-label="Navigate to Home"
            >
              <TerminalIcon className="w-8 h-8 mr-2 text-neonGreen-DEFAULT transition-transform duration-300 group-hover:scale-110" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-neonGreen-DEFAULT tracking-wider transition-colors duration-300 group-hover:text-neonGreen-light">
                  <span className="typing-text animate-typing" style={{ animationDuration: '1.8s', animationTimingFunction: 'steps(20,end)'}}>AI CORE INTERFACE</span>
                  <span className="typing-caret"></span>
                </h1>
                <p className="text-center sm:text-left text-neonCyan-light text-xs sm:text-sm transition-colors duration-300 group-hover:text-neonCyan-DEFAULT">
                 <span className="typing-text animate-typingFast" style={{ animationDuration: '2.5s', animationTimingFunction: 'steps(35,end)', animationDelay: '0.3s'}}>Projekt Ckryptbit // GLITCHCORE_NAV_v3.1</span>
                 <span className="typing-caret" style={{animationDelay: '0.3s'}}></span>
                </p>
              </div>
            </div>
            
            <Button
              onClick={toggleMenu}
              variant="stealth" 
              className="p-1.5 border-2 border-transparent hover:border-neonGreen-DEFAULT focus:border-neonGreen-DEFAULT group"
              aria-label="Toggle Navigation Menu"
              aria-expanded={isMenuOpen}
            >
              <MenuTriggerIcon className={`text-neonGreen-DEFAULT group-hover:text-neonGreen-light ${isMenuOpen ? 'rotate-90 text-neonMagenta-DEFAULT' : ''}`} />
            </Button>
          </div>
        </div>
      </header>
      
      <GlitchCoreMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
        cartItemCount={cartItemCount}
      />
    </>
  );
};