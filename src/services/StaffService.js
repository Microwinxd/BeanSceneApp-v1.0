import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';

const USERS_COLLECTION = 'users';

// ✅ CREATE STAFF (ADMIN USE)
export async function createStaff({ name, email, password, role }) {
  if (!name) throw new Error('name is required');
  if (!email) throw new Error('email is required');
  if (!password) throw new Error('password is required');

  const docRef = await addDoc(collection(db, USERS_COLLECTION), {
    name,
    email,
    password,              // ⚠️ stored as record (assessment model)
    role: role || 'staff',
    mustResetPassword: true,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

// ✅ LOGIN USING FIRESTORE (NO FIREBASE AUTH)
export async function loginWithFirestore(email, password) {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('email', '==', email)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('User not found');
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  if (userData.password !== password) {
    throw new Error('Invalid password');
  }

  return {
    id: userDoc.id,
    ...userData,
  };
}

// ✅ UPDATE PASSWORD (AFTER FIRST LOGIN)
export async function updateStaffPassword(userId, newPassword) {
  if (!userId) throw new Error('userId is required');
  if (!newPassword) throw new Error('new password is required');

  const ref = doc(db, USERS_COLLECTION, userId);
  await updateDoc(ref, {
    password: newPassword,
    mustResetPassword: false,
  });
}
