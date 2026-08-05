import 'server-only';

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let resolved: Firestore | null | undefined;

/**
 * Returns null when FIREBASE_ADMIN_CREDENTIALS is missing or unusable so callers
 * can skip the cache tier instead of failing the request.
 */
export function getAdminFirestore(): Firestore | null {
  if (resolved === undefined) resolved = initFirestore();
  return resolved;
}

function initFirestore(): Firestore | null {
  const credentials = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (!credentials) return null;

  try {
    const app = getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(credentials) as ServiceAccount) });
    return getFirestore(app);
  } catch (error) {
    console.warn('[firebase/admin] Admin SDK 초기화 실패 — 캐시 계층을 건너뜁니다.', error);
    return null;
  }
}
