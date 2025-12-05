// src/screens/Main/Menu/MenuListScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput
} from 'react-native';
import { loadMenuWithOfflineSupport } from '../../../services/OfflineMenu';



export default function MenuListScreen({ route }) {
  const role = route?.params?.role ?? 'staff';

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
const [dataSource, setDataSource] = useState('online');


  useEffect(() => {
    let isMounted = true;
    


    async function load() {
  setIsLoading(true);
  setError('');

  try {
    const { categories, items, source } = await loadMenuWithOfflineSupport();

    if (!isMounted) return;

    const sortedItems = items.sort((a, b) =>
      (a?.name || '').toLowerCase().localeCompare((b?.name || '').toLowerCase())
    );

    setCategories(categories);
    setMenuItems(sortedItems);
    setDataSource(source);

    if (categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }

    if (source === 'empty') {
      setError('No internet and no cached menu available.');
    }

  } catch (e) {
    console.error('Failed to load menu:', e);
    if (isMounted) setError('Failed to load menu.');
  } finally {
    if (isMounted) setIsLoading(false);
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


  const renderCategory = ({ item }) => {
    const isActive = item.id === selectedCategoryId;
    return (
      <TouchableOpacity
        style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
        onPress={() => setSelectedCategoryId(item.id)}
      >
        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMenuItem = ({ item }) => {
    return (
      <View style={[styles.menuItem, !item.isAvailable && styles.menuItemUnavailable]}>
       


        <Image source={{uri: item.imageUrl || 'https://via.placeholder.com/80'}}
        style = {styles.menuItemImage} resizeMode='cover'>
        

        </Image>


          <View style={styles.menuItemContent}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          ) : null}

          {item.dietaryFlags && item.dietaryFlags.length > 0 && (
            <Text style={styles.menuItemFlags}>
              {item.dietaryFlags.join(' · ')}
            </Text>
          )}
        </View>

        <Text style={styles.menuItemPrice}>${item.price?.toFixed(2)}</Text>
      </View>
    );
  };

  if (isLoading) {
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

  return (
    <View style={styles.container}>
      <Text style={styles.roleText}>Current role: {role}</Text>
      {dataSource === 'offline' && (
  <Text style={{ color: 'orange', marginBottom: 6 }}>
    ⚠ Offline mode – showing saved menu
  </Text>
)}

      <TextInput
  style={styles.searchInput}
  placeholder="Search menu item..."
  value={searchText}
  onChangeText={setSearchText}
  clearButtonMode="while-editing"
/>


      {/* Категории */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          renderItem={renderCategory}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Список блюд */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.menuListContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No items in this category.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  roleText: {
    marginBottom: 8,
    fontSize: 14,
    color: '#666',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextActive: {
    color: '#fff',
  },
  menuListContent: {
    paddingBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  menuItemUnavailable: {
    opacity: 0.5,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuItemFlags: {
    fontSize: 12,
    color: '#009688',
    marginTop: 4,
  },
  menuItemPrice: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
  },
  menuItem: {
  flexDirection: 'row',
  alignItems: 'center',     // ✅ center image + text
  paddingVertical: 12,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: '#ddd',
},

menuItemImage: {
  width: 80,
  height: 80,
  borderRadius: 8,
  marginRight: 12,
  backgroundColor: '#eee',
},

menuItemContent: {
  flex: 1,
},

menuItemUnavailable: {
  opacity: 0.5,
},
searchInput: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  marginBottom: 12,
  fontSize: 16,
  backgroundColor: '#fff',
},


});
