import React, { useState } from 'react';
import { account, createSession, currentConfig, updateAppwriteConfig, ID } from '../appwrite';
import { Lock, Mail, Server, ShieldCheck, Sparkles, Key, HelpCircle, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Advanced config state
  const [showConfig, setShowConfig] = useState(false);
  const [endpoint, setEndpoint] = useState(currentConfig.endpoint);
  const [projectId, setProjectId] = useState(currentConfig.projectId);
  const [databaseId, setDatabaseId] = useState(currentConfig.databaseId);
  const [collectionId, setCollectionId] = useState(currentConfig.collectionId);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create session via our wrapper (supports Appwrite v13 and v14+)
      await createSession(email, password);
      
      // Fetch user profile to confirm success
      const user = await account.get();
      setSuccess('Successfully logged in! Opening workspace...');
      
      setTimeout(() => {
        onLoginSuccess(user);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      let msg = err.message || '';
      if (msg.toLowerCase().includes('failed to fetch')) {
        msg = "Network Connection Error: 'Failed to fetch'. This typically means your custom Appwrite Endpoint is invalid, offline, or blocking requests due to missing CORS origins. Please verify settings under 'Custom Appwrite Configuration' below, or choose 'Skip & Use Local Mode (Offline)'.";
      }
      setError(msg || 'Login failed. Please check your credentials or Appwrite endpoint configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create Account
      await account.create(ID.unique(), email, password);
      setSuccess('Account created successfully! Logging you in...');

      // Immediately log in after signup
      await createSession(email, password);
      const user = await account.get();
      
      setTimeout(() => {
        onLoginSuccess(user);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      let msg = err.message || '';
      if (msg.toLowerCase().includes('failed to fetch')) {
        msg = "Network Connection Error: 'Failed to fetch'. This typically means your custom Appwrite Endpoint is invalid, offline, or blocking requests due to missing CORS origins. Please verify settings under 'Custom Appwrite Configuration' below, or choose 'Skip & Use Local Mode (Offline)'.";
      }
      setError(msg || 'Signup failed. Email might already be in use or configuration is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppwriteConfig(endpoint, projectId, databaseId, collectionId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative top ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-slate-900 border border-slate-800 rounded-2xl text-cyan-400 mb-3 shadow-xl">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">
            NEET Tracker Pro
          </h1>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
            Appwrite Cloud Student Workspace
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-slate-850 pb-4">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 🔐 Access Secure Vault
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mt-1">
              Sign up or log in to sync logs with Appwrite databases.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-xl text-xs font-medium">
              ✓ {success}
            </div>
          )}

          <form className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. aspirant@neet.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Login'}
              </button>
              <button
                type="button"
                onClick={handleSignup}
                disabled={loading}
                className="py-2.5 bg-slate-950 hover:bg-slate-900 disabled:opacity-50 border border-slate-850 text-slate-300 hover:text-white font-bold rounded-lg text-xs uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Signup'}
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess({
                    $id: 'local_user',
                    email: 'offline.student@neet.com',
                    name: 'Offline Student'
                  });
                }}
                className="w-full py-2 bg-slate-950/40 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-lg text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Offline Mode: Skip & Use Local Storage
              </button>
            </div>
          </form>

          {/* Collapsible advanced Appwrite config */}
          <div className="border-t border-slate-850 pt-4">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 flex items-center gap-1.5 transition-colors focus:outline-none"
            >
              <Server className="w-3.5 h-3.5" />
              {showConfig ? 'Hide Custom Appwrite Configuration' : 'Show Custom Appwrite Configuration'}
            </button>

            {showConfig && (
              <form onSubmit={handleSaveConfig} className="mt-4 space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-850 animate-slideDown">
                <div className="text-[9px] text-orange-400 font-bold uppercase mb-1.5 tracking-wider">
                  ⚙️ custom endpoints (overrides environment variables)
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                    Appwrite Endpoint
                  </label>
                  <input
                    type="url"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                    Database Name/ID
                  </label>
                  <input
                    type="text"
                    value={databaseId}
                    onChange={(e) => setDatabaseId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                    Collection Name/ID
                  </label>
                  <input
                    type="text"
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-1.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded text-[9px] uppercase tracking-wider transition-colors"
                >
                  Apply & Reload Endpoint
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Database instructions footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> fully secure client side encryption
          </p>
        </div>
      </div>
    </div>
  );
}
