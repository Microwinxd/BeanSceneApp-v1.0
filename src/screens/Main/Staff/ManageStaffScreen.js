import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';

import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from 'firebase/firestore';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './../../../services/firebase';

export default function ManageUsersScreen({ navigation, route }) {
  const currentUserId = route?.params?.userId ?? null;
  const currentUserRole = route?.params?.role ?? 'staff';

  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [password, setPassword] = useState('');

  // ✅ LOAD USERS
  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const list = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsers(list);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load users');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ ADD USER
  const openAddUser = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('staff');
    setPassword('');
    setModalVisible(true);
  };

  // ✅ EDIT USER
  const openEditUser = (user) => {
    setEditingUser(user);
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setRole(user.role ?? 'staff');
    setModalVisible(true);
  };

  // ✅ SAVE USER (AUTH + FIRESTORE)
  const saveUser = async () => {
    if (!name || !email || !role || (!editingUser && !password)) {
      Alert.alert('Validation', 'All fields are required');
      return;
    }

    try {
      if (editingUser) {
        // ✅ UPDATE USER PROFILE (NOT AUTH)
        await updateDoc(doc(db, 'users', editingUser.id), {
          name,
          role,
        });
      } else {
        // ✅ CREATE REAL AUTH USER
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

        const uid = userCredential.user.uid;

        // ✅ CREATE FIRESTORE PROFILE USING UID (SECURE)
        await setDoc(doc(db, 'users', uid), {
          name,
          email: email.trim().toLowerCase(),
          role,
          createdAt: new Date(),
        });
      }

      setModalVisible(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    }
  };

  // ✅ DELETE USER (FIRESTORE ONLY — AUTH DELETION REQUIRES CLOUD FUNCTION)
  const deleteUser = (user) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', user.id));
              loadUsers();
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Users</Text>

      <TouchableOpacity style={styles.addButton} onPress={openAddUser}>
        <Text style={styles.addButtonText}>Add New User</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userRole}>Role: {item.role}</Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditUser(item)}
            >
              <Text style={styles.buttonText}>✏️ Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteUser(item)}
            >
              <Text style={styles.buttonText}>🗑 Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ✅ MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingUser ? 'Edit User' : 'Add User'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!editingUser}
          />

          <TextInput
            style={styles.input}
            placeholder="Role (admin or staff)"
            placeholderTextColor="#888"
            value={role}
            onChangeText={setRole}
          />

          {!editingUser && (
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          )}

          <TouchableOpacity style={styles.saveButton} onPress={saveUser}>
            <Text style={styles.buttonText}>💾 Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },

  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },

  card: {
  width: '100%',              // ✅ FULL WIDTH
  alignSelf: 'stretch',
  borderWidth: 1,
  borderColor: '#ddd',
  padding: 16,
  borderRadius: 10,
  marginBottom: 16,
  backgroundColor: '#fff',
  elevation: 2,               // ✅ Android shadow
},


  userName: {
  fontWeight: '700',
  fontSize: 18,
  marginBottom: 6,
},

userEmail: {
  fontSize: 15,
  color: '#555',
  marginBottom: 6,
},

userRole: {
  fontSize: 14,
  fontWeight: '600',
  color: '#083944',
},


  editButton: {
    backgroundColor: '#083944',
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
    alignItems: 'center',
  },

  deleteButton: {
    backgroundColor: '#083944',
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
    alignItems: 'center',
  },

  modalContainer: { flex: 1, padding: 24, justifyContent: 'center' },

  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },

  saveButton: {
    backgroundColor: '#083944',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },

  cancelButton: {
    backgroundColor: '#083944',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
 addButton: {
    backgroundColor: '#083944',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    width: 700,
    alignSelf:'center'
  },

  addButtonText: { color: '#fff', fontWeight: '600' },

});
