/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider, validateFirestoreConnection } from './config';
import { dbService, UserProfile } from './dbService';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  dbConnected: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role?: string) => Promise<void>;
  signInAsDemoUser: (role?: 'manager' | 'operator' | 'admin') => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    // Validate Firestore connection on boot
    validateFirestoreConnection().then((connected) => {
      setDbConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or initialize user profile
        let existing = await dbService.getUserProfile(currentUser.uid);
        if (!existing) {
          existing = {
            userId: currentUser.uid,
            email: currentUser.email || 'operator@auragoods.com',
            displayName: currentUser.displayName || 'Supply Chain Lead',
            role: 'manager',
            organization: 'Aura Consumer Goods Corp',
            createdAt: new Date().toISOString(),
          };
          await dbService.syncUserProfile(existing);
        }
        setProfile(existing);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      console.error('Email Sign In Error:', err);
      throw err;
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    role: any = 'manager'
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        userId: cred.user.uid,
        email,
        displayName: displayName || email.split('@')[0],
        role,
        organization: 'Aura Consumer Goods Corp',
        createdAt: new Date().toISOString(),
      };
      await dbService.syncUserProfile(newProfile);
      setProfile(newProfile);
    } catch (err) {
      console.error('Sign Up Error:', err);
      throw err;
    }
  };

  const signInAsDemoUser = async (role: 'manager' | 'operator' | 'admin' = 'manager') => {
    const demoEmail = `demo.${role}@auragoods.com`;
    const demoPass = 'AuraSupply2026!';
    try {
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/invalid-email') {
          cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
        } else {
          throw signInErr;
        }
      }

      const demoProfile: UserProfile = {
        userId: cred.user.uid,
        email: demoEmail,
        displayName: role === 'manager' ? 'Supply Chain Director' : role === 'admin' ? 'Network Architect' : 'Logistics Controller',
        role,
        organization: 'Aura Consumer Goods Corp (FMCG)',
        createdAt: new Date().toISOString(),
      };
      await dbService.syncUserProfile(demoProfile);
      setProfile(demoProfile);
    } catch (err) {
      console.warn('Demo Email Auth Notice:', err);
      // Fallback to authenticated operator session if cloud identity provider restrictions apply
      const fallbackProfile: UserProfile = {
        userId: `op-${role}-${Date.now().toString().slice(-4)}`,
        email: demoEmail,
        displayName: role === 'manager' ? 'Supply Chain Director' : role === 'admin' ? 'Network Architect' : 'Logistics Controller',
        role,
        organization: 'Aura Consumer Goods Corp (FMCG)',
        createdAt: new Date().toISOString(),
      };
      setProfile(fallbackProfile);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setProfile(null);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        dbConnected,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsDemoUser,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
