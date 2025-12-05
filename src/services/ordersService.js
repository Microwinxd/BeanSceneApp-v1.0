// src/services/ordersService.js
import {
    addDoc,
    collection,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    getDocs,
    setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const ORDERS_COLLECTION = 'orders';

export async function createOrder({
  tableRef,
  items,
  notes,
  userId,
  total,
  status = 'pending',
  createdAt,
}) {
  if (!tableRef) throw new Error('tableRef is required');
  if (!userId) throw new Error('userId is required');
  if (!items || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  // ✅ 1️⃣ COUNT EXISTING ORDERS
  const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
  const orderNumber = snapshot.size + 1;

  // generate custom order id 
  const orderId = `Order${orderNumber}`;


  await setDoc(doc(db, ORDERS_COLLECTION, orderId), {
    orderId,
    tableRef,
    items,
    notes: notes || '',
    status,
    total: Number(total ?? 0),
    createdByUserId: userId,
    createdAt: createdAt || serverTimestamp(),
  });

  return orderId;
}



//Slushaem Zakazy (mne vpadlu nazhimat' shift alt)
export function listenToOrders(callback) {
    const q = query(
    collection(db, ORDERS_COLLECTION),
    orderBy('createdAt', 'desc'),
  );

    const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(orders);
    },
    (error) => {
      console.error('listenToOrders error:', error);
      callback([]); // на всякий случай
    },
  );

  return unsubscribe;
}

export async function updateOrderStatus(orderId, status) {
  if (!orderId) throw new Error('orderId is required');
  const ref = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(ref, { status });
}