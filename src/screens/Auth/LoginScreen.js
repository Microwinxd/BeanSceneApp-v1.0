// src/screens/Auth/LoginScreen.js
import React, { useState } from 'react';
import {
  Image,
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { checkConnection } from "../../services/networkGuard";

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!(await checkConnection())) return;

    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        throw new Error('User profile not found in database');
      }

      const userData = userSnap.data();

      const targetRoute =
        userData.role === 'admin' ? 'AdminHomeScreen' : 'StaffHomeScreen';

      navigation.reset({
        index: 0,
        routes: [
          {
            name: targetRoute,
            params: {
              userId: firebaseUser.uid,
              role: userData.role,
            },
          },
        ],
      });
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ✅ LOGO */}
        <View style={styles.logoContainer}>
          <Image
            source={require('./../../images/Logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* ✅ FORM */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Bean Scene Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <Pressable style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingBottom: 60,
  },

  logoContainer: {
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 40,
  marginBottom: 20,
  paddingVertical: 20,
  },

  logo: {
  width: '80%',
  height: 140,        // ✅ force taller render
  minHeight: 120,    // ✅ prevent collapse
},


  formContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 40,
    paddingBottom: 80,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },

  input: {
    width: '90%',
    maxWidth: 640,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    alignSelf: 'center',
    color: '#000',
    backgroundColor: '#fff',
  },

  button: {
    width: '90%',
    maxWidth: 640,
    backgroundColor: '#083944',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 14,
    paddingHorizontal: 12,
    minHeight: 48,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
