// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Дениска, твой конфиг из Firebase Console. НЕ ТРОГАТЬ БЛЯТЬ!
const firebaseConfig = {
  apiKey: 'AIzaSyDdjlVqdZnfOtdcbZedY3Kvgve3Os5nXAs',
  authDomain: 'beanscene-ordering.firebaseapp.com',
  projectId: 'beanscene-ordering',
  storageBucket: 'beanscene-ordering.firebasestorage.app',
  messagingSenderId: '615691535026',
  appId: '1:615691535026:web:540152021f977d5c257fab',
};

// Инициализация приложения
const app = initializeApp(firebaseConfig);

// Экспортируем то, что реально используем в RN
export const auth = getAuth(app);
export const db = getFirestore(app);
