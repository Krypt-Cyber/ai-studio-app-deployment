
import React from 'react';
import { Button } from './ui/Button';
import { ActiveView, User } from '../types';

// --- Icon Definitions ---
const ArchitectIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.25 20.25h3.5m-3.5 0a.75.75 0 01-.75-.75V13.5m0 0v6.75m0-6.75H4.5m6.75 0v-3.75H4.5m6.75 3.75h3.5M13 13.5v6.75a.75.75 0 00.75.75h3.5M13 13.5V9.75h6.75m-6.75 3.75H19.5m0 0V12M4.5 6H12m0 0v3.75m0-3.75a2.25 2.25 0 00-4.5 0M12 6v3.75a2.25 2.25 0 004.5 0V6m-4.5 0H4.5m0 0a2.25 2.25 0 00-2.25 2.25v1.5A2.25 2.25 0 004.5 12h15a2.25 2.25 0 002.25-2.25v-1.5A2.25 2.25 0 0019.5 6H12z" />
  </svg>
);

const AgentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M19.5 8.25h-1.5m-15 3.75h1.5m15 0h1.5m-18 3.75h1.5M19.5 15.75h-1.5M12 19.5V18m0-15V4.5m0 15V18M9.75 6A2.25 2.25 0 0112 3.75v0A2.25 2.25 0 0114.25 6v0A2.25 2.25 0 0112 8.25v0A2.25 2.25 0 019.75 6v0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 18A2.25 2.25 0 0112 15.75v0A2.25 2.25 0 0114.25 18v0A2.25 2.25 0 0112 20.25v0A2.25 2.25 0 019.75 18v0zM6 9.75A2.25 2.25 0 013.75 12v0A2.25 2.25 0 016 14.25v0A2.25 2.25 0 018.25 12v0A2.25 2.25 0 016 9.75v0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9.75A2.25 2.25 0 0115.75 12v0A2.25 2.25 0 0118 14.25v0A2.25 2.25 0 0120.25 12v0A2.25 2.25 0 0118 9.75v0z" />
  </svg>
);

const StoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h2.64m-13.5 0H2.36m13.5 0H9.75M12 12.75c0 .414-.168.75-.375.75S11.25 13.164 11.25 12.75s.168-.75.375-.75.375.336.375.75zM12 12.75V9M9.75 21v-7.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21m0 0h13.5M12 12.75c0 .414.168.75.375.75s.375-.336.375-.75q0-.092-.013-.181M12 3c-.815 0-1.603.06-2.368.173M12 3c.815 0 1.603.06 2.368.173m0 0A3.752 3.752 0 0118 5.25v9.75A3.75 3.75 0 0114.25 18.75h-4.5A3.75 3.75 0 016 15V5.25A3.752 3.752 0 019.632 3.173M12 3c-.398 0-.79.018-1.174.052M12 3c.398 0 .79.018 1.174.052" />
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

const AdminShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622A11.99 11.99 0 0020.402 6a11.959 11.959 0 01-3.402-1.286m-6.997 0V2.25L12 2.25m0 0l.283.015M12 2.25a2.25 2.25 0 00-2.25 2.25V9" />
  </svg>
);

const AdminShieldCogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c5.176-1.332 9-6.03 9-11.622A11.99 11.99 0 0012 2.25C6.824 3.618 3 8.316 3 9.75c0 5.592 3.824 10.29 9 11.623z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V6M12 18v-1.5M16.5 12h1.5M6 12h1.5m4.243-4.243l1.06-1.06M7.757 16.243l1.06-1.06m6.364-4.243l-1.06-1.06m-4.243 6.364l-1.06-1.06" />
  </svg>
);
// --- End Icon Definitions ---

interface LandingPageViewProps {
  setActiveView: (view: ActiveView) => void;
  isAuthenticated: boolean;
  currentUser: User | null;
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  targetView: ActiveView;
  onClick: (view: ActiveView) => void;
  colorClass?: string; // e.g., 'neonGreen', 'neonCyan', 'neonMagenta'
  titleAnimationDelay?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, buttonText, targetView, onClick, colorClass = 'neonGreen', titleAnimationDelay = '0s' }) => {
  const hoverShadowClass = `hover:shadow-${colorClass}-glow`;
  const iconColorClass = `text-${colorClass}-DEFAULT`;
  const titleColorClass = `text-${colorClass}-light`;
  const buttonBorderClass = `border-${colorClass}-DEFAULT`;
  const buttonTextColorClass = `text-${colorClass}-DEFAULT`;
  const buttonHoverBgClass = `hover:bg-${colorClass}-DEFAULT`;

  const scanlineStyle = { '--scanline-color': `rgba(${colorClass === 'neonGreen' ? '0,255,0' : colorClass === 'neonCyan' ? '0,255,255' : '255,0,255'}, 0.15)` } as React.CSSProperties;


  return (
    <div className={`p-5 sm:p-6 bg-neutral-dark border border-neutral-medium rounded-md shadow-lg ${hoverShadowClass} transition-all duration-300 card-hover-effect group relative scanline-container overflow-hidden flex flex-col`}>
      <div className="scanline-overlay group-hover:opacity-100 opacity-0 transition-opacity duration-300" style={scanlineStyle}></div>
      <div className={`w-12 h-12 mb-4 ${iconColorClass} mx-auto`}>{icon}</div>
      <h3 className={`text-xl font-semibold ${titleColorClass} mb-2 group-hover:animate-subtleGlitch typing-text animate-typingFast`} style={{animationDuration: '1.2s', animationTimingFunction: 'steps(18,end)', animationDelay: titleAnimationDelay}}>
        {title}
        <span className="typing-caret" style={{animationDelay: titleAnimationDelay}}></span>
      </h3>
      <p className="text-xs text-neutral-light text-center mb-5 flex-grow">{description}</p>
      <Button 
        onClick={() => onClick(targetView)} 
        variant="outline" 
        size="md" 
        className={`w-full sm:w-auto mx-auto mt-auto ${buttonBorderClass} ${buttonTextColorClass} ${buttonHoverBgClass} hover:text-black`}
      >
        {buttonText}
      </Button>
    </div>
  );
};


const LandingPageView: React.FC<LandingPageViewProps> = ({ setActiveView, isAuthenticated, currentUser }) => {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 text-center animate-fadeIn">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neonGreen-DEFAULT tracking-wider mb-3">
        <span className="typing-text animate-typing" style={{animationDuration: '2.2s', animationTimingFunction: 'steps(20,end)'}}>Projekt Ckryptbit</span>
        <span className="typing-caret"></span>
      </h1>
      <h2 className="text-lg sm:text-xl text-neonCyan-light mb-10 font-mono">
        <span className="typing-text animate-typingFast" style={{animationDuration: '1.5s', animationTimingFunction: 'steps(20,end)', animationDelay: '2.3s'}} >// INITIATE DIRECTIVE //</span>
        <span className="typing-caret" style={{animationDelay: '2.3s'}}></span>
      </h2>
      <p className="max-w-3xl mx-auto text-neutral-light mb-10 sm:mb-16 text-sm sm:text-base leading-relaxed animate-fadeIn-delay" style={{animationDelay: '3.8s'}}>
        Advanced System Architecture, AI Augmentation & Secure Asset Procurement.
        Your central hub for next-generation project development and operational command.
      </p>

      {/* --- CORE MODULES --- */}
      <section className="my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-neonCyan-DEFAULT mb-8 typing-text animate-typing" style={{animationDuration: '1.5s', animationTimingFunction: 'steps(20,end)'}}>
            // CORE SYSTEMS ONLINE //
            <span className="typing-caret"></span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <FeatureCard
            title="System Architect"
            description="Design tech stacks, generate project blueprints, and manage files in an interactive AI-assisted environment."
            icon={<ArchitectIcon />}
            buttonText="ENGAGE ARCHITECT"
            targetView="architect"
            onClick={setActiveView}
            colorClass="neonGreen"
            titleAnimationDelay="0.2s"
          />
          <FeatureCard
            title="AI Agent Comms"
            description="Interface with diverse AI protocols for code generation, analysis, research, and command execution."
            icon={<AgentIcon />}
            buttonText="UPLINK TO AI"
            targetView="chat"
            onClick={setActiveView}
            colorClass="neonCyan"
            titleAnimationDelay="0.4s"
          />
        </div>
      </section>

      {/* --- OPERATOR SERVICES --- */}
      {isAuthenticated && (
        <section className="my-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neonCyan-DEFAULT mb-8 typing-text animate-typing" style={{animationDuration: '1.8s', animationTimingFunction: 'steps(25,end)'}}>
            // OPERATOR SERVICES //
            <span className="typing-caret"></span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <FeatureCard
              title="Secure Asset Store"
              description="Procure classified digital assets, conceptual schematics, and specialized cyber-security services."
              icon={<StoreIcon />}
              buttonText="ACCESS STORE"
              targetView="shop"
              onClick={setActiveView}
              colorClass="neonMagenta"
              titleAnimationDelay="0.6s"
            />
            <FeatureCard
              title="My Intel Packets"
              description="Access and review your acquired digital intelligence, AI-generated reports, and custom schematics."
              icon={<PackageIcon />}
              buttonText="VIEW MY ASSETS"
              targetView="my_digital_assets"
              onClick={setActiveView}
              colorClass="neonGreen"
              titleAnimationDelay="0.8s"
            />
            <FeatureCard
              title="Cyber Operations Hub"
              description="Monitor and manage your commissioned KI-driven security assessments and reconnaissance missions."
              icon={<CogIcon />}
              buttonText="MANAGE OPERATIONS"
              targetView="pentest_orders"
              onClick={setActiveView}
              colorClass="neonCyan"
              titleAnimationDelay="1.0s"
            />
          </div>
        </section>
      )}

      {/* --- ADMINISTRATION --- */}
      {isAuthenticated && currentUser?.isAdmin && (
        <section className="my-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neonMagenta-DEFAULT mb-8 typing-text animate-typing" style={{animationDuration: '1.7s', animationTimingFunction: 'steps(22,end)'}}>
            // ADMIN CONSOLE //
            <span className="typing-caret"></span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <FeatureCard
              title="Asset Management"
              description="Oversee system assets, manage product listings, and define parameters for cyber services & digital intel."
              icon={<AdminShieldIcon />}
              buttonText="MANAGE ASSETS"
              targetView="admin_products"
              onClick={setActiveView}
              colorClass="neonMagenta"
              titleAnimationDelay="1.2s"
            />
            <FeatureCard
              title="Cyber Ops Command"
              description="Monitor and manage all commissioned cyber security service orders and review generated reports."
              icon={<AdminShieldCogIcon />}
              buttonText="OPS COMMAND"
              targetView="admin_pentest_orders"
              onClick={setActiveView}
              colorClass="neonMagenta"
              titleAnimationDelay="1.4s"
            />
          </div>
        </section>
      )}

      {/* --- AUTHENTICATION --- */}
      <section className="my-12">
        {!isAuthenticated ? (
          <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-center sm:items-center sm:space-x-4">
            <Button onClick={() => setActiveView('login')} variant="primary" size="lg" className="w-full sm:w-auto px-8 py-3">OPERATOR LOGIN</Button>
            <Button onClick={() => setActiveView('register')} variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3 border-neonCyan-DEFAULT text-neonCyan-DEFAULT hover:bg-neonCyan-DEFAULT hover:text-black">REGISTER OPERATOR ID</Button>
          </div>
        ) : (
          <div className="text-lg text-neonGreen-light">
            Operator <span className="font-bold text-neonGreen-DEFAULT">{currentUser?.username}</span> // System Access Authorized
            {currentUser?.isAdmin && <span className="block text-sm text-neonMagenta-DEFAULT">(Admin Privileges Active)</span>}
          </div>
        )}
      </section>

      <p className="mt-16 text-xs text-neutral-medium font-mono">
        // Projekt Ckryptbit v3.1.5 // STATUS: OPERATIONAL // BACKGROUND: ENHANCED // LANDING_SEQ: COMPLETE //
      </p>
    </div>
  );
};

export default LandingPageView;