// src/services/menuService.js
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';

// Load categories
export async function fetchCategories() {
  const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Загрузить все элементы меню
export async function fetchMenuItems() {
  const snapshot = await getDocs(collection(db, 'menuItems'));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}
