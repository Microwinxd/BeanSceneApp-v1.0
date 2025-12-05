import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { fetchCategories, fetchMenuItems } from './menuService';

const CACHE_KEY = 'OFFLINE_MENU_CACHE';

export async function loadMenuWithOfflineSupport() {
  const netState = await NetInfo.fetch();

  // ✅ ONLINE → LOAD FROM API & CACHE
  if (netState.isConnected) {
    const [categories, items] = await Promise.all([
      fetchCategories(),
      fetchMenuItems(),
    ]);

    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ categories, items }),
    );

    return { categories, items, source: 'online' };
  }

  // ✅ OFFLINE → LOAD FROM CACHE
  const cached = await AsyncStorage.getItem(CACHE_KEY);

  if (cached) {
    return { ...JSON.parse(cached), source: 'offline' };
  }

  // ❌ OFFLINE & NO CACHE
  return { categories: [], items: [], source: 'empty' };
}
