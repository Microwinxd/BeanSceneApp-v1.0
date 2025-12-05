// src/screens/Main/Orders/NewOrderSelectTableScreen.js
import React, { useEffect, useState } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
  ScrollView, // ✅ FIX 1: ADD THIS
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const tableColumns = isTablet ? 4 : 2;

export default function NewOrderSelectTableScreen({ navigation, route }) {
  const role = route?.params?.role ?? 'staff';
  const userId = route?.params?.userId ?? null;

  const [areas, setAreas] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedTableRef, setSelectedTableRef] = useState(null);

  const loadTables = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'tables'));
      const data = snapshot.docs.map(doc => doc.data());

      const grouped = {};
      data.forEach(item => {
        if (!grouped[item.area]) grouped[item.area] = [];
        grouped[item.area].push(item.name);
      });

      const areaList = Object.keys(grouped).map(area => ({
        id: area,
        name: area,
        tables: grouped[area],
      }));

      setAreas(areaList);
      setSelectedArea(areaList[0]);
      setTables(grouped[areaList[0].name]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load tables from database');
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleNext = () => {
    if (!selectedTableRef) {
      alert('Please select a table.');
      return;
    }

    navigation.navigate('NewOrderSelectItems', {
      role,
      userId,
      tableRef: selectedTableRef,
    });
  };

  const renderArea = ({ item }) => {
    const isActive = item.name === selectedArea?.name;
    return (
      <TouchableOpacity
        style={[styles.areaButton, isActive && styles.areaButtonActive]}
        onPress={() => {
          setSelectedArea(item);
          setTables(item.tables);
          setSelectedTableRef(null);
        }}
      >
        <Text style={[styles.areaText, isActive && styles.areaTextActive]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTable = ({ item }) => {
    const isActive = item === selectedTableRef;
    return (
      <TouchableOpacity
        style={[styles.tableButton, isActive && styles.tableButtonActive]}
        onPress={() => setSelectedTableRef(item)}
      >
        <Text style={[styles.tableText, isActive && styles.tableTextActive]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.header}>New Order – Select Table</Text>

      <View style={styles.logoContainer}>
        <Image
          source={require('../../../images/Logo.jpg')}
          style={styles.logo}
        />
      </View>

      <Text style={styles.subheader}>Current role: {role}</Text>

      <Text style={styles.sectionTitle}>Area</Text>

      <FlatList
        data={areas}
        keyExtractor={(item) => item.id}
        renderItem={renderArea}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.areasList}
      />

      <Text style={styles.sectionTitle}>Table</Text>

      {/* ✅ Non-scrolling grid inside ScrollView */}
      <FlatList
        data={tables}
        keyExtractor={(item) => item}
        renderItem={renderTable}
        numColumns={tableColumns}
        contentContainerStyle={styles.tablesGrid}
        scrollEnabled={false}   // ✅ IMPORTANT
      />

      {/* ✅ SINGLE Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!selectedTableRef || !userId) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
          disabled={!selectedTableRef || !userId}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
  minHeight: '100%',          // ✅ fills full screen height
  flexGrow: 1,                // ✅ allows vertical expansion
  justifyContent: 'flex-start', // ✅ keeps content at top but fills height
  backgroundColor: '#fff',
  paddingHorizontal: isTablet ? 36 : 16,
  paddingTop: 16,
  paddingBottom: 40,
},

  header: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '600',
    marginBottom: 6,
  },

  subheader: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
    marginBottom: 12,
  },

  logoContainer: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 20,
  },

  logo: {
    width: isTablet ? 200 : 120,
    height: isTablet ? 80 : 50,
    resizeMode: 'contain',
  },

  sectionTitle: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
  },

  areasList: {
    marginBottom: 16,
    marginTop: 12,
  },

  areaButton: {
    height: isTablet ? 48 : 42,
    paddingHorizontal: isTablet ? 26 : 18,
    borderRadius: 22,
    marginRight: 12,
    minWidth: isTablet ? 140 : 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
  },

  areaButtonActive: {
    backgroundColor: '#083944',
  },

  areaText: {
    fontSize: isTablet ? 16 : 14,
    color: '#000',
    fontWeight: '600',
  },

  areaTextActive: {
    color: '#fff',
  },

  tableButton: {
    paddingVertical: isTablet ? 12 : 8,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    minWidth: isTablet ? 120 : 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },

  tableButtonActive: {
    backgroundColor: '#083944',
    borderColor: '#083944',
  },

  tableText: {
    fontSize: isTablet ? 16 : 14,
    color: '#333',
    fontWeight: '500',
  },

  tableTextActive: {
    color: '#fff',
  },

  tablesGrid: {
    paddingTop: 4,
  },

 footer: {
  marginTop: 24,              // ✅ pushes button into unused space naturally
  paddingBottom: isTablet ? 30 : 20,
},

  nextButton: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#083944',
    paddingVertical: isTablet ? 18 : 14,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
  },

  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },

  nextButtonText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
  },
});
