/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../firebase/authContext';
import {
  User,
  Shield,
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  Building,
  CheckCircle2,
  Database,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    profile,
    dbConnected,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsDemoUser,
    logOut,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'manager' | 'operator' | 'admin'>('manager');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName, role);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'manager' | 'operator' | 'admin') => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      await signInAsDemoUser(demoRole);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-200 shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">
              {user ? 'Supply Chain Operator Identity' : 'Enterprise Authentication'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Database Connectivity Status Indicator */}
        <div className="mt-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Cloud Firestore Database:</span>
          </div>
          <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
            dbConnected
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : 'bg-amber-950 text-amber-300 border-amber-800'
          }`}>
            {dbConnected ? 'ONLINE & SYNCED' : 'CONNECTING...'}
          </span>
        </div>

        {/* Logged In View */}
        {user || profile ? (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 font-bold">
                  {profile?.displayName?.[0] || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{profile?.displayName || 'Active Operator'}</h4>
                  <p className="text-xs text-slate-400 font-mono">{user?.email || profile?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-700/60">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Role</span>
                  <span className="font-semibold text-emerald-400 capitalize">{profile?.role || 'Manager'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Organization</span>
                  <span className="font-semibold text-slate-200">{profile?.organization || 'Aura Consumer Goods'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                await logOut();
                onClose();
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Log Out Current Session</span>
            </button>
          </div>
        ) : (
          /* Not Logged In View: 1-Click Demo Profiles + Email/Pass Form */
          <div className="mt-4 space-y-4">
            {/* Quick 1-Click Demo Access for Judges */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                1-Click Instant Demo Authentication
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDemoLogin('manager')}
                  className="p-2.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 text-left transition cursor-pointer"
                >
                  <span className="font-bold text-xs text-white block">Director</span>
                  <span className="text-[10px] text-blue-300">Manager Role</span>
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDemoLogin('operator')}
                  className="p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-left transition cursor-pointer"
                >
                  <span className="font-bold text-xs text-white block">Logistics</span>
                  <span className="text-[10px] text-emerald-300">Operator Role</span>
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDemoLogin('admin')}
                  className="p-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 text-left transition cursor-pointer"
                >
                  <span className="font-bold text-xs text-white block">Architect</span>
                  <span className="text-[10px] text-purple-300">Admin Role</span>
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-mono">or enterprise credentials</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Henderson"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="manager">Supply Chain Manager</option>
                      <option value="operator">Logistics Controller</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@auragoods.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition shadow-md shadow-blue-600/30 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{mode === 'signin' ? 'Sign In to Operations Console' : 'Create Operator Account'}</span>
              </button>
            </form>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
              <span>{mode === 'signin' ? 'Need an account?' : 'Already registered?'}</span>
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                {mode === 'signin' ? 'Register New Profile' : 'Sign In'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
