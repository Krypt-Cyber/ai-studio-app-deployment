
import React, { useEffect, useRef } from 'react';
import { ActiveView, User } from '../types';
import { Button } from './ui/Button';
import { useTextScramble } from '../hooks/useTextScramble'; // Import the custom hook

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Basic icons for menu items (can be expanded)
const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M12 21.75V12m0 0V2.25" />
  </svg>
);

const ArchitectIconMenu: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.25 20.25h3.5m-3.5 0a.75.75 0 01-.75-.75V13.5m0 0v6.75m0-6.75H4.5m6.75 0v-3.75H4.5m6.75 3.75h3.5M13 13.5v6.75a.75.75 0 00.75.75h3.5M13 13.5V9.75h6.75m-6.75 3.75H19.5m0 0V12M4.5 6H12m0 0v3.75m0-3.75a2.25 2.25 0 00-4.5 0M12 6v3.75a2.25 2.25 0 004.5 0V6m-4.5 0H4.5m0 0a2.25 2.25 0 00-2.25 2.25v1.5A2.25 2.25 0 004.5 12h15a2.25 2.25 0 002.25-2.25v-1.5A2.25 2.25 0 0019.5 6H12z" />
  </svg>
);

const AgentIconMenu: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M19.5 8.25h-1.5m-15 3.75h1.5m15 0h1.5m-18 3.75h1.5M19.5 15.75h-1.5M12 19.5V18m0-15V4.5m0 15V18M9.75 6A2.25 2.25 0 0112 3.75v0A2.25 2.25 0 0114.25 6v0A2.25 2.25 0 0112 8.25v0A2.25 2.25 0 019.75 6v0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 18A2.25 2.25 0 0112 15.75v0A2.25 2.25 0 0114.25 18v0A2.25 2.25 0 0112 20.25v0A2.25 2.25 0 019.75 18v0zM6 9.75A2.25 2.25 0 013.75 12v0A2.25 2.25 0 016 14.25v0A2.25 2.25 0 018.25 12v0A2.25 2.25 0 016 9.75v0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9.75A2.25 2.25 0 0115.75 12v0A2.25 2.25 0 0118 14.25v0A2.25 2.25 0 0120.25 12v0A2.25 2.25 0 0118 9.75v0z" />
  </svg>
);

const StoreIconMenu: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h2.64m-13.5 0H2.36m13.5 0H9.75M12 12.75c0 .414-.168.75-.375.75S11.25 13.164 11.25 12.75s.168-.75.375-.75.375.336.375.75zM12 12.75V9M9.75 21v-7.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75-.75V21m0 0h13.5M12 12.75c0 .414.168.75.375.75s.375-.336.375-.75q0-.092-.013-.181M12 3c-.815 0-1.603.06-2.368.173M12 3c.815 0 1.603.06 2.368.173m0 0A3.752 3.752 0 0118 5.25v9.75A3.75 3.75 0 0114.25 18.75h-4.5A3.75 3.75 0 016 15V5.25A3.752 3.752 0 019.632 3.173M12 3c-.398 0-.79.018-1.174.052M12 3c.398 0 .79.018 1.174.052" />
  </svg>
);

const PackageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 8.25h3M12 3v5.25m0 0l-1.125-1.125M12 8.25l1.125-1.125M3.75 7.5h16.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5M12 9.75V4.5m0 15V12m0 0a2.25 2.25 0 00-2.25-2.25M12 12a2.25 2.25 0 002.25-2.25M12 12a2.25 2.25 0 01-2.25 2.25M12 12a2.25 2.25 0 012.25 2.25m0 0h1.5a2.25 2.25 0 002.25-2.25M16.5 12a2.25 2.25 0 00-2.25 2.25m0 0V18m2.25-3.75a2.25 2.25 0 012.25-2.25M16.5 12a2.25 2.25 0 012.25-2.25m0 0H18m-2.25 3.75a2.25 2.25 0 00-2.25 2.25M7.5 12a2.25 2.25 0 002.25 2.25m0 0V18m-2.25-3.75a2.25 2.25 0 01-2.25-2.25M7.5 12a2.25 2.25 0 01-2.25-2.25m0 0H6M9.75 6a2.25 2.25 0 00-2.25-2.25M9.75 6a2.25 2.25 0 012.25-2.25m0 0V3m2.25 3a2.25 2.25 0 002.25-2.25M14.25 6a2.25 2.25 0 01-2.25-2.25m0 0V3" />
  </svg>
);

const LoginIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M9 15l3-3m0 0l-3-3m3 3H3" />
  </svg>
);

interface GlitchCoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  onLogout: () => void;
  cartItemCount: number;
}

interface MenuItemConfig {
  label?: string; // Made optional
  targetView?: ActiveView; // Made optional
  icon?: React.ReactNode;
  badgeCount?: () => number | null;
  condition?: () => boolean; // True if item should be shown
  isDivider?: boolean;
}


interface MenuItemProps {
  label: string;
  targetView: ActiveView;
  currentView: ActiveView;
  onClick: (view: ActiveView) => void;
  icon?: React.ReactNode;
  className?: string;
  badgeCount?: number | null;
  disabled?: boolean;
  itemIndex: number; 
  menuIsOpen: boolean; 
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  label, 
  targetView, 
  currentView, 
  onClick, 
  icon, 
  className = '', 
  badgeCount, 
  disabled = false,
  itemIndex,
  menuIsOpen
}) => {
  const isActive = currentView === targetView;
  
  const displayedLabel = useTextScramble(label, {
    play: menuIsOpen,
    speed: 40, // ms per character update
    scrambleDuration: 200, // ms, should be less than menuItemAppearAnimation duration
    revealDelay: itemIndex * 60, // Stagger start of scramble/reveal
  });

  return (
    <button
      onClick={() => !disabled && onClick(targetView)}
      disabled={disabled}
      className={`
        w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-sm 
        transition-all duration-150 ease-in-out group transform active:scale-[0.97]
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-darkest
        ${isActive 
          ? 'bg-neonGreen-DEFAULT text-black shadow-neon-green-glow ring-neonGreen-light' 
          : `text-neonGreen-light hover:bg-neutral-dark hover:text-neonGreen-DEFAULT hover:shadow-md focus:ring-neonGreen-DEFAULT ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        ${className}
        ${menuIsOpen ? 'menu-item-appear' : 'opacity-0'} 
      `}
      style={{ animationDelay: menuIsOpen ? `${itemIndex * 50}ms` : '0ms' }} // Stagger the button's visual appearance
      aria-current={isActive ? 'page' : undefined}
    >
      {icon && React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { 
        className: `w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-black' : 'text-neonGreen-DEFAULT group-hover:text-neonGreen-light'}` 
      })}
      <span className="flex-grow text-left scrambling-text">{displayedLabel}</span>
      {badgeCount != null && badgeCount > 0 && (
        <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-black/20 text-black' : 'bg-neonMagenta-DEFAULT text-black'}`}>
          {badgeCount}
        </span>
      )}
    </button>
  );
};


export const GlitchCoreMenu: React.FC<GlitchCoreMenuProps> = ({
  isOpen,
  onClose,
  activeView,
  setActiveView,
  isAuthenticated,
  currentUser,
  onLogout,
  cartItemCount,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      menuRef.current.focus();
    }
  }, [isOpen]);
  
  const handleNavigation = (view: ActiveView) => {
    setActiveView(view);
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  const menuItemsConfig: MenuItemConfig[] = [
    { label: "Core Interface (Home)", targetView: "landing", icon: <HomeIcon />, condition: () => true },
    { label: "System Architect", targetView: "architect", icon: <ArchitectIconMenu />, condition: () => true },
    { label: "AI Agent Comms", targetView: "chat", icon: <AgentIconMenu />, condition: () => true },
    { isDivider: true, condition: () => true },
    { label: "Secure Store", targetView: "shop", icon: <StoreIconMenu />, condition: () => isAuthenticated },
    { label: "Carrier Manifest", targetView: "cart", icon: <PackageIcon />, badgeCount: () => cartItemCount, condition: () => isAuthenticated },
    { label: "My Intel Packets", targetView: "my_digital_assets", icon: <AgentIconMenu />, condition: () => isAuthenticated },
    { label: "My Cyber Ops", targetView: "pentest_orders", icon: <CogIcon />, condition: () => isAuthenticated },
    { isDivider: true, condition: () => isAuthenticated && !!currentUser?.isAdmin },
    { label: "ADMIN: Asset Console", targetView: "admin_products", icon: <StoreIconMenu />, condition: () => isAuthenticated && !!currentUser?.isAdmin },
    { label: "ADMIN: Ops Command", targetView: "admin_pentest_orders", icon: <CogIcon />, condition: () => isAuthenticated && !!currentUser?.isAdmin },
    { isDivider: true, condition: () => !isAuthenticated },
    { label: "Operator Login", targetView: "login", icon: <LoginIcon />, condition: () => !isAuthenticated },
    { label: "Register Operator ID", targetView: "register", icon: <CogIcon />, condition: () => !isAuthenticated },
  ];
  
  let visibleItemIndex = 0;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-neutral-darkest/70 backdrop-blur-sm z-[90] transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="glitchcore-menu-title"
        tabIndex={-1} // Make it focusable
        className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-neutral-darkest shadow-2xl shadow-neonGreen-dark/30 z-[100]
                    border-l-2 border-neonGreen-DEFAULT 
                    transform transition-transform duration-300 ease-in-out flex flex-col
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="p-4 border-b border-neutral-dark flex justify-between items-center">
          <h2 id="glitchcore-menu-title" className="text-lg font-semibold text-neonGreen-DEFAULT">
            NAVIGATION MATRIX
          </h2>
          <Button
            onClick={onClose}
            variant="stealth"
            className="p-1 text-neonMagenta-DEFAULT hover:text-neonMagenta-light"
            aria-label="Close navigation menu"
          >
            <CloseIcon className="w-6 h-6" />
          </Button>
        </header>

        <nav className="flex-grow p-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-medium scrollbar-track-neutral-dark">
          {menuItemsConfig.map((item, idx) => {
            if (item.condition && !item.condition()) {
              return null;
            }
            if (item.isDivider) {
              return <hr key={`divider-${idx}`} className="border-neutral-dark my-2" />;
            }
            const currentItemIndex = visibleItemIndex++;
            return (
              <MenuItem
                key={item.targetView || `item-${idx}`}
                label={item.label!} 
                targetView={item.targetView!}
                currentView={activeView}
                onClick={handleNavigation}
                icon={item.icon}
                badgeCount={item.badgeCount ? item.badgeCount() : undefined}
                itemIndex={currentItemIndex}
                menuIsOpen={isOpen}
              />
            );
          })}
        </nav>

        <footer className="p-3 border-t border-neutral-dark">
          {isAuthenticated && currentUser && (
            <div className="mb-2">
              <p className="text-xs text-neonCyan-light">Operator: <span className="font-semibold text-neonGreen-light">{currentUser.username}</span></p>
              {currentUser.isAdmin && <p className="text-xs text-neonMagenta-DEFAULT font-bold">ADMIN ACCESS GRANTED</p>}
            </div>
          )}
           {isAuthenticated && (
            <Button onClick={handleLogoutClick} variant="danger" size="md" className="w-full">
              <LogoutIcon className="w-5 h-5 mr-2"/>
              TERMINATE SESSION
            </Button>
          )}
          {!isAuthenticated && (
            <p className="text-xs text-center text-neutral-medium">System Status: Anonymous Uplink</p>
          )}
        </footer>
      </div>
    </>
  );
};
