
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { TextInput } from './ui/TextInput';
import { ActiveView } from '../types';

interface RegisterViewProps {
  onRegister: (username: string, email: string, password?: string) => string | null; // Returns error message or null
  setActiveView: (view: ActiveView) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onRegister, setActiveView }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Access codes do not match.");
      return;
    }
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const registerError = onRegister(username, email, password);
      if (registerError) {
        setError(registerError);
      }
      // If registration is successful, App.tsx will handle login and view change.
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 sm:p-8 bg-neutral-darker shadow-2xl rounded-md border-2 border-neutral-dark">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-neonGreen-DEFAULT">NEW OPERATOR REGISTRATION</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextInput
          label="Desired Callsign (Username)"
          id="register-username"
          value={username}
          onChange={setUsername}
          placeholder="Choose a unique callsign"
        />
        <TextInput
          label="Secure Email"
          id="register-email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter your secure email address"
        />
        <TextInput
          label="Access Code (Password)"
          id="register-password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Create a strong access code"
        />
        <TextInput
          label="Confirm Access Code"
          id="register-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter your access code"
        />
        {error && <p className="text-xs text-neonMagenta-DEFAULT text-center p-2 bg-neonMagenta-DEFAULT/10 border border-neonMagenta-dark rounded-sm">{error}</p>}
        <Button type="submit" variant="primary" size="lg" className="w-full shadow-neon-green-glow" isLoading={isLoading}>
          REGISTER OPERATOR ID
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-light">
        Already have an Operator ID?{' '}
        <button
          onClick={() => setActiveView('login')}
          className="font-medium text-neonCyan-light hover:text-neonCyan-DEFAULT underline focus:outline-none"
        >
          Login to Terminal
        </button>
      </p>
    </div>
  );
};
