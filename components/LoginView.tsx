
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { TextInput } from './ui/TextInput';
import { ActiveView } from '../types';

interface LoginViewProps {
  onLogin: (username: string, password?: string) => string | null; // Returns error message or null
  setActiveView: (view: ActiveView) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, setActiveView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const loginError = onLogin(username, password);
      if (loginError) {
        setError(loginError);
      }
      // If login is successful, App.tsx will change the view.
      // If not, error is displayed.
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 sm:p-8 bg-neutral-darker shadow-2xl rounded-md border-2 border-neutral-dark">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-neonGreen-DEFAULT">OPERATOR LOGIN TERMINAL</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <TextInput
          label="Username / Callsign"
          id="login-username"
          value={username}
          onChange={setUsername}
          placeholder="Enter your operator callsign"
        />
        <TextInput
          label="Password / Access Code"
          id="login-password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter secure access code"
        />
        {error && <p className="text-xs text-neonMagenta-DEFAULT text-center p-2 bg-neonMagenta-DEFAULT/10 border border-neonMagenta-dark rounded-sm">{error}</p>}
        <Button type="submit" variant="primary" size="lg" className="w-full shadow-neon-green-glow" isLoading={isLoading}>
          AUTHENTICATE
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-light">
        No access credentials?{' '}
        <button
          onClick={() => setActiveView('register')}
          className="font-medium text-neonCyan-light hover:text-neonCyan-DEFAULT underline focus:outline-none"
        >
          Register new Operator ID
        </button>
      </p>
    </div>
  );
};
