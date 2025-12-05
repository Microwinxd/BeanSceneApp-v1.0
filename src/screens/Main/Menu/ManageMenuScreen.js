import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  Switch,
  Pressable,
  TouchableOpacity
} from 'react-native';

import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { checkConnection } from "./../../../services/networkGuard";

import { db } from './../../../services/firebase';

export default function ManageMenuScreen({ navigation, route }) {

  
  const makeSafeDocId = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

  const userId = route?.params?.userId ?? null;
  const role = route?.params?.role ?? 'staff';

  const [menuItems, setMenuItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [category, setCategory] = useState('');


  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [available, setAvailable] = useState(true);

  // ✅ LOAD MENU
  
  const loadMenu = async () => {
    try {
       if (!(await checkConnection())) return;
      const querySnapshot = await getDocs(collection(db, 'menuItems'));
      const list = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setMenuItems(list);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load menu items');
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);


  const openAddModal = () => {
    
    
    setEditingItem(null);
    setName('');
    setPrice('');
    setCategory('');
    setDescription('');
    setAvailable(true);
    setModalVisible(true);
  };

  const openEditModal = (item) => {
  setEditingItem(item);
  setName(item.name ?? '');
  setPrice(String(item.price ?? 0));
  setDescription(item.description ?? '');
  setCategory(item.category ?? '');   // ✅ LOAD CATEGORY
  setAvailable(item.available === undefined ? true : item.available);
  setModalVisible(true);
};
;

  const saveItem = async () => {
    if (!(await checkConnection())) return;
    if (!name || !price) {
      Alert.alert('Validation', 'Name and price are required');
      return;
    }

    const safeAvailable = available === undefined ? true : available;
    const safeDocId = makeSafeDocId(name);

    try {
      if (editingItem) {
        if (safeDocId === editingItem.id) {
          await updateDoc(doc(db, 'menuItems', editingItem.id), {
            name,
            price: Number(price),
            description: description ?? '',
            category: category ?? '',        // ✅ SAVE CATEGORY
            available: safeAvailable,
            });

        } else {
          await setDoc(doc(db, 'menuItems', safeDocId), {
            name,
            price: Number(price),
            description: description ?? '',
            category: category ?? '',        // ✅ SAVE CATEGORY
            available: safeAvailable,
            });

          await deleteDoc(doc(db, 'menuItems', editingItem.id));
        }
      } else {
        await setDoc(doc(db, 'menuItems', safeDocId), {
          name,
          price: Number(price),
          description: description ?? '',
          available: safeAvailable,
        });
      }

      setModalVisible(false);
      loadMenu();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const deleteItem = async (item) => {
     if (!(await checkConnection())) return;
  Alert.alert(
    'Delete Item',
    `Are you sure you want to delete "${item.name}"?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'menuItems', item.id));
            loadMenu(); // ✅ Refresh after delete
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to delete item');
          }
        },
      },
    ]
  );
};


  return (
    <View style={styles.container}>

      <Text style={styles.title}>Manage Menu</Text>

      
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText }> Add New Item</Text>
      </TouchableOpacity>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemName}>{item.name}</Text>

        <Text style={styles.itemCategory}>
          Category: {item.category || 'Uncategorized'}
        </Text>

        <Text style={styles.itemPrice}>${item.price}</Text>

        <Text style={styles.itemDescription}>
          {item.description}
        </Text>

          <Text style={styles.itemStatus}>
            Status: {item.available ? 'Available' : 'Unavailable'}
            </Text>


            <TouchableOpacity
          style={styles.saveButton}
            onPress={openEditModal}
          activeOpacity={0.8}
          >
          <Text style={{ color: '#fff' }}>Edit </Text>
          </TouchableOpacity>
            <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteItem(item)}
            activeOpacity={0.8}
          >
          <Text style={{ color: '#fff' }}>Delete</Text>
          </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>

          <Text style={styles.modalTitle}>
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Price"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
        style={styles.input}
        placeholder="Category (e.g. Drinks, Mains, Desserts)"
        value={category}
        onChangeText={setCategory}
            />

          <View style={styles.switchRow}>
            <Text>Available</Text>
            <Switch value={available} onValueChange={setAvailable} />
          </View>

          <TouchableOpacity
          style={styles.saveButton}
          onPress={saveItem}
          activeOpacity={0.8}>
            <Text style={{ color: '#fff' }} >Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setModalVisible(false)}
          activeOpacity={0.8}>
            <Text style={{ color: '#fff' }}>Cancel</Text>
          </TouchableOpacity>

        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16, textAlign: 'center' },

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

 card: {
  width: '100%',              // ✅ FULL WIDTH (fixes cutoff)
  alignSelf: 'stretch',
  borderWidth: 1,
  borderColor: '#ddd',
  padding: 16,
  borderRadius: 10,
  marginBottom: 16,
  backgroundColor: '#fff',
  elevation: 2,               // ✅ subtle shadow (Android)
},


  itemName: { fontWeight: '700', fontSize: 18, marginBottom: 6 },


  editButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },

  modalContainer: { flex: 1, padding: 24, justifyContent: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '600', marginBottom: 20, textAlign: 'center' },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },

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
  deleteButton: {
  backgroundColor: '#083944',
  padding: 10,
  borderRadius: 6,
  marginTop: 8,
  alignItems: 'center',
},
itemName: { 
  fontWeight: '700', 
  fontSize: 20,      // ✅ BIGGER TITLE
  marginBottom: 6 
},

itemCategory: {
  fontSize: 15,      // ✅ Bigger category text
  color: '#666',
  marginBottom: 4,
},

itemPrice: {
  fontSize: 18,      // ✅ Bigger price
  fontWeight: '700',
  marginBottom: 4,
},

itemDescription: {
  fontSize: 15,      // ✅ Bigger description
  color: '#333',
  marginBottom: 6,
},

itemStatus: {
  fontSize: 14,
  fontWeight: '600',
  marginBottom: 10,
},


});
