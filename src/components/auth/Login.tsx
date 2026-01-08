import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Props for the Login component:
// - onLoginSuccess: callback invoked with the authenticated user after successful login
interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

// Login component: simple email/password form that uses Supabase to authenticate.
export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data.user) {
      onLoginSuccess(data.user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm flex flex-col items-center">
        <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-blue-100 text-4xl">
          👨‍👩‍👧‍👦
        </div>
        <h1 className="text-2xl font-bold mb-2 text-blue-700">FamilyPlanner</h1>
        <p className="mb-6 text-gray-500 text-center">Willkommen! Bitte melde dich an.</p>

        <input
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {errorMessage && (
          <div className="w-full mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 text-center">
            {errorMessage}
          </div>
        )}
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold hover:bg-blue-700 transition-colors mb-2"
          disabled={loading}
        >
          {loading ? 'Wird eingeloggt…' : 'Login'}
        </button>
      </div>
    </div>
  );
}
