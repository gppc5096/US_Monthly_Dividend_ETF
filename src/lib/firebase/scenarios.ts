import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type CollectionReference,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { z } from 'zod';

import { getFirebaseDb } from '@/lib/firebase/client';
import { portfolioInputSchema, portfolioResultSchema } from '@/lib/schema/portfolioInput';
import type { Scenario, ScenarioDraft } from '@/lib/types/scenario';

const USERS_COLLECTION = 'users';
const SCENARIOS_COLLECTION = 'scenarios';
const CREATED_AT_FIELD = 'createdAt';

const storedScenarioSchema = z.object({
  title: z.string(),
  input: portfolioInputSchema,
  result: portfolioResultSchema,
  commentary: z.string().nullable(),
  asOf: z.string(),
});

function scenariosRef(uid: string): CollectionReference {
  return collection(getFirebaseDb(), USERS_COLLECTION, uid, SCENARIOS_COLLECTION);
}

export async function createScenario(uid: string, draft: ScenarioDraft): Promise<string> {
  const created = await addDoc(scenariosRef(uid), {
    ...draft,
    [CREATED_AT_FIELD]: serverTimestamp(),
  });
  return created.id;
}

export async function listScenarios(uid: string): Promise<Scenario[]> {
  const snapshot = await getDocs(query(scenariosRef(uid), orderBy(CREATED_AT_FIELD, 'desc')));
  return snapshot.docs
    .map(toScenario)
    .filter((scenario): scenario is Scenario => scenario !== null);
}

export async function deleteScenario(uid: string, scenarioId: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), USERS_COLLECTION, uid, SCENARIOS_COLLECTION, scenarioId));
}

/** Returns null for documents written by an older schema so one bad row cannot break the list. */
function toScenario(snapshot: QueryDocumentSnapshot<DocumentData>): Scenario | null {
  const data = snapshot.data();
  const parsed = storedScenarioSchema.safeParse(data);
  if (!parsed.success) {
    console.warn(`[firebase/scenarios] 저장 형식이 맞지 않아 건너뜁니다: ${snapshot.id}`);
    return null;
  }
  const createdAt = data[CREATED_AT_FIELD];
  return {
    id: snapshot.id,
    ...parsed.data,
    createdAt: createdAt instanceof Timestamp ? createdAt.toDate().toISOString() : '',
  };
}
