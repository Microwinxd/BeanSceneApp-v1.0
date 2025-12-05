// src/screens/Main/Orders/NewOrderSelectItemsScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput   
} from 'react-native';
import {
  fetchCategories,
  fetchMenuItems,
} from '../../../services/menuService';

export default function NewOrderSelectItemsScreen({ navigation, route }) {
  const role = route?.params?.role ?? 'staff';
  const userId = route?.params?.userId ?? null;
  const tableRef = route?.params?.tableRef ?? null;

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');


  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [cats, items] = await Promise.all([
          fetchCategories(),
          fetchMenuItems(),
        ]);

        if (!isMounted) return;
        setCategories(cats);
        setMenuItems(items);
        if (cats.length > 0) setSelectedCategoryId(cats[0].id);
      } catch (e) {
        console.error('Failed to load menu for order:', e);
        if (isMounted) setError('Failed to load menu.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
  let filtered = selectedCategoryId
    ? menuItems.filter(item => item.categoryId === selectedCategoryId)
    : menuItems;

  if (searchText.trim().length > 0) {
    const query = searchText.toLowerCase();
    filtered = filtered.filter(item =>
      (item?.name || '').toLowerCase().includes(query)
    );
  }

  return filtered.sort((a, b) =>
    (a?.name || '').toLowerCase().localeCompare((b?.name || '').toLowerCase())
  );
}, [menuItems, selectedCategoryId, searchText]);


  const handleChangeQuantity = (itemId, delta) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const handleNext = () => {
    const selectedItems = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menuItems.find((m) => m.id === id);
        if (!item) return null;
        return {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: qty,
          notes: '',
          dietaryFlags: item.dietaryFlags || [],
        };
      })
      .filter(Boolean);

    if (selectedItems.length === 0) {
      alert('Please add at least one item to the order.');
      return;
    }

    navigation.navigate('NewOrderSummary', {
      role,
      userId,
      tableRef,
      items: selectedItems,
    });
  };

  const renderCategory = ({ item }) => {
    const isActive = item.id === selectedCategoryId;
    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          isActive && styles.categoryButtonActive,
        ]}
        onPress={() => setSelectedCategoryId(item.id)}
      >
        <Text
          style={[
            styles.categoryText,
            isActive && styles.categoryTextActive,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const qty = quantities[item.id] || 0;

    return (
      <View style={styles.menuItem}>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.menuItemDescription}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.flagsRow}>
  {Array.isArray(item.dietaryFlags) &&
  item.dietaryFlags.filter(f => f.trim() !== '').length > 0 ? (

    item.dietaryFlags
      .filter(f => f.trim() !== '')   // ✅ REMOVE EMPTY STRINGS
      .map((flag, index) => (
        <View key={index} style={styles.flagBadge}>
          <Text style={styles.flagText}>{flag}</Text>
        </View>
      ))

  ) : (
    <Text style={styles.noFlagsText}>None</Text>   // ✅ SHOW NONE
  )}
</View>



          <Text style={styles.menuItemPrice}>
            ${item.price?.toFixed(2)}
          </Text>
        </View>

        <View style={styles.qtyContainer}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => handleChangeQuantity(item.id, -1)}
          >
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => handleChangeQuantity(item.id, +1)}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
const hasSelectedItems = Object.values(quantities).some(qty => qty > 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        New Order – Items for table {tableRef}
      </Text>
      <Text style={styles.subheader}>Current role: {role}</Text>
      <TextInput
  style={styles.searchInput}
  placeholder="Search menu item..."
  value={searchText}
  onChangeText={setSearchText}
  clearButtonMode="while-editing"
/>


      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.menuListContent}
      />

      <View style={styles.footer}>
      <TouchableOpacity
    style={[
      styles.nextButton,
      (!hasSelectedItems || !userId) && styles.nextButtonDisabled,
    ]}
    onPress={handleNext}
    activeOpacity={0.8}
    disabled={!hasSelectedItems || !userId}
        >
    <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 8 },
  errorText: { color: 'red', textAlign: 'center', padding: 16 },
  header: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  subheader: { fontSize: 14, color: '#666', marginBottom: 8 },
  categoriesContainer: { marginBottom: 8 },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#083944',
    borderColor: '#333',
  },
  categoryText: { color: '#333' },
  categoryTextActive: { color: '#fff' },
  menuListContent: { paddingBottom: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  menuItemName: { fontSize: 16, fontWeight: '600' },
  menuItemDescription: { fontSize: 14, backgroundcolor: '#083944', marginTop: 2 },
  menuItemPrice: { fontSize: 14, marginTop: 4 },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#083944',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: { fontSize: 18, fontWeight: '600' },
  qtyText: { width: 28, textAlign: 'center', marginHorizontal: 4 },
  

  flagsRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 4,
  },
  flagBadge: {
  backgroundColor: '#083944',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 6,
  marginRight: 6,
  marginTop: 4,
  },
  flagText: {
  color: '#fff',
  fontSize: 11,
  fontWeight: '600',
},
noFlagsText: {
  fontSize: 12,
  color: '#888',
  fontStyle: 'italic',
  marginTop: 4,
},
nextButton: {
  backgroundColor: '#083944',
  paddingVertical: 14,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: 10,
  marginBottom: 40,
},

nextButtonDisabled: {
  backgroundColor: '#ccc',
},

nextButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
searchInput: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  marginBottom: 10,
  fontSize: 16,
  backgroundColor: '#fff',
},
footer: {
  paddingBottom: 20,   // ✅ PUSH WHOLE FOOTER UP
},

});
