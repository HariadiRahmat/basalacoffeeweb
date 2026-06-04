"use client";

import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { fetchOwnerProfile } from "@/lib/firestore-data";
import { OwnerProfile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: OwnerProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const p = await fetchOwnerProfile(nextUser.uid);
        if (!p || p.role !== "owner") {
          await firebaseSignOut(getFirebaseAuth());
          setUser(null);
          setProfile(null);
        } else {
          setProfile(p);
        }
      } catch {
        await firebaseSignOut(getFirebaseAuth());
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password,
      );
      const p = await fetchOwnerProfile(cred.user.uid);
      if (!p) {
        await firebaseSignOut(getFirebaseAuth());
        return "Profil tidak ditemukan.";
      }
      if (p.role !== "owner") {
        await firebaseSignOut(getFirebaseAuth());
        return "Akun ini bukan owner. Gunakan akun owner untuk dashboard web.";
      }
      setProfile(p);
      return null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login gagal";
      if (msg.includes("invalid-credential") || msg.includes("wrong-password")) {
        return "Email atau kata sandi salah.";
      }
      return msg;
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, signIn, signOut }),
    [user, profile, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
