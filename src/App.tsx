import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import TodoList from './components/TodoList';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Session prüfen und Family-ID laden
  useEffect(() => {
    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        // console.log('profile query id:', currentUser.id, 'typeof:', typeof currentUser.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, family_id')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        // console.log('profile data', data);

        if (data) {
          setFamilyId(data.family_id);
          setProfileId(data.id);
        }
      }
    };
    init();
  }, []);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      setUser(data.user);
      // Family-ID nach Login laden
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, family_id')
        .eq('user_id', data.user.id)
        .maybeSingle();
      if (profile) {
        setFamilyId(profile.family_id);
        setProfileId(profile.id);
      }
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto mt-20">
      {!user && (
        <>
          <h2 className="text-xl font-bold mb-4">Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full mb-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full mb-2 rounded"
          />
          <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            Login
          </button>
        </>
      )}

      {user && !familyId && <p>Loading family data...</p>}

      {user && familyId && profileId && (
        <TodoList familyId={familyId} currentUserId={user.id} currentProfileId={profileId} />
      )}
    </div>
  );
}
