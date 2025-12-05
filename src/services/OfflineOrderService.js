import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createOrder } from './ordersService';

const QUEUE_KEY = 'OFFLINE_ORDER_QUEUE';

// ✅ SAVE ORDER WHEN OFFLINE
export async function saveOfflineOrder(order) {
  const existing = await AsyncStorage.getItem(QUEUE_KEY);
  const queue = existing ? JSON.parse(existing) : [];

  queue.push({
    ...order,
    localId: Date.now().toString(), // ✅ prevent duplicates
    synced: false,
  });

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// ✅ SYNC ALL QUEUED ORDERS WHEN INTERNET RETURNS
export async function syncOfflineOrders() {
  const net = await NetInfo.fetch();
  if (!net.isConnected) return;

  const stored = await AsyncStorage.getItem(QUEUE_KEY);
  if (!stored) return;

  const queue = JSON.parse(stored);
  const remaining = [];

  for (const order of queue) {
    try {
      await createOrder(order);   // ✅ SEND TO FIRESTORE
    } catch (err) {
      console.warn('Sync failed, keeping order:', err);
      remaining.push(order);
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}
    