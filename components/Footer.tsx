
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-darkest mt-auto py-4 text-center border-t-2 border-neutral-dark">
      <p className="text-neonGreen-dark text-xs">
        &copy; {new Date().getFullYear()} Projekt Ckryptbit by Joel Jaquet
      </p>
    </footer>
  );
};