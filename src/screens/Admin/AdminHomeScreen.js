import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Touchable } from 'react-native/types_generated/index';

export default function ManageScreen({ navigation, route }) {

  const userId = route?.params?.userId ?? null;
  const role = route?.params?.role ?? 'admin';

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

      {/* ✅ TITLE */}
      <Text style={styles.title}>Home</Text>

      {/* ✅ GRID */}
      <View style={styles.grid}>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('NewOrderSelectTable', { userId, role })}
          >
            <Text style={styles.buttonText}>Place order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ManageMenuScreen', { userId, role })}
          >
            <Text style={styles.buttonText}>Manage menu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('OrdersList', { userId, role })}
          >
            <Text style={styles.buttonText}>View order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ManageStaffScreen', { userId, role })}
          >
            <Text style={styles.buttonText}>Manage Staff</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ReportScreen', { userId, role })}
          >
            <Text style={styles.buttonText}>View report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MenuList', { userId, role })}
          >
            <Text style={styles.buttonText}>View menu</Text>
          </TouchableOpacity>

          
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Log out</Text>
          </TouchableOpacity>



        </View>

      </View>

    </ScrollView>
  );
}

export const styles = StyleSheet.create({
 container: {
  paddingHorizontal: 20,
  paddingTop: 24,
  backgroundColor: '#f2f2f2',
},


  title: {
    fontSize: 26,
    fontWeight: '400',           // ✅ lighter like your image
    color: '#1b5e63',
    marginBottom: 24,
  },

  grid: {
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,            // ✅ vertical spacing between rows
  },

  button: {
    width: '46%',                // ✅ square-ish like your screenshot
    height: 90,                  // ✅ button height
    backgroundColor: '#083944',  // ✅ dark teal
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,             // ✅ sharp corners like image
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
