import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView
} from 'react-native';

export default function StaffHomeScreen({ navigation, route }) {

  // ✅ SAFE PARAM EXTRACTION WITH FALLBACKS
  const userId = route?.params?.userId ?? null;
  const role = route?.params?.role ?? 'staff';

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );
  };

 return (
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={styles.container}
    showsVerticalScrollIndicator={true}
  >

    <View style={styles.headerContainer}>
      <Text style={styles.title}>Bean Scene – Staff Home</Text>
      <Text style={styles.roleText}>Role: {role}</Text>
    </View>

    <View style={styles.gridContainer}>

      <TouchableOpacity style={styles.gridButton}
        onPress={() => navigation.navigate('NewOrderSelectTable', { userId, role })}>
        <Text style={styles.buttonText}>Place Order</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.gridButton}
        onPress={() => navigation.navigate('MenuList', { userId, role })}>
        <Text style={styles.buttonText}>View Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.gridButton}
        onPress={() => navigation.navigate('OrdersList', { userId, role })}>
        <Text style={styles.buttonText}>Orders</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('MenuList', { userId, role })}
        >
        <Text style={styles.buttonText}>View menu</Text>
        </TouchableOpacity>

      <TouchableOpacity style={[styles.gridButton, styles.logoutButton]}
        onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>

    </View>

  </ScrollView>
);

}
const styles = StyleSheet.create({
  container: {
  flexGrow: 1,
  padding: 16,   // ✅ saves vertical space
  backgroundColor: '#fff',
},

headerContainer: {
  marginTop: 20,     // ✅ half the space
  marginBottom: 20,
  alignItems: 'center',
},

  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },

  roleText: {
    fontSize: 14,
    color: '#666',
  },

  //  GRID LAYOUT
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',     
    justifyContent: 'space-between',
  },

  gridButton: {
  width: '47%',
  minHeight: 65,
  paddingVertical: 14,
  backgroundColor: '#083944',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 10,
  borderRadius: 6,
},


  logoutButton: {
    backgroundColor: '#083944', // 
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
