import { onAuthStateChanged, signInAnonymously, type Auth, type User } from 'firebase/auth';

import { getFirebaseAuth } from '@/lib/firebase/client';

let pending: Promise<User> | null = null;

/** Resolves the anonymous uid, signing in on first call and reusing it afterwards. */
export function ensureAnonUser(): Promise<User> {
  pending ??= resolveUser().catch((cause) => {
    pending = null;
    throw cause;
  });
  return pending;
}

async function resolveUser(): Promise<User> {
  const auth = getFirebaseAuth();
  const restored = await firstAuthState(auth);
  if (restored) return restored;
  const credential = await signInAnonymously(auth);
  return credential.user;
}

/** Waits for the SDK to rehydrate a persisted session before deciding to sign in. */
function firstAuthState(auth: Auth): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      },
    );
  });
}
