// src/screens/Main/Orders/OrdersListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,            // ✅ REQUIRED
} from 'react-native';

import {
  listenToOrders,
  createOrder,
  updateOrderStatus,
} from './../../../services/ordersService';

import { doc, deleteDoc } from 'firebase/firestore';   
import { db } from '../../../services/firebase';       
import NetInfo from '@react-native-community/netinfo';
import { syncOfflineOrders } from './../../../services/OfflineOrderService';


export default function OrdersListScreen({ navigation, route }) {
  const role = route?.params?.role ?? 'staff';
  const userId = route?.params?.userId ?? null;
  

  const [orders, setOrders] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToOrders(setOrders);
    return unsubscribe;
  }, []);
  useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      syncOfflineOrders();   // ✅ AUTO SYNC QUEUED ORDERS
    }
  });

  return () => unsubscribe();
}, []);


const handleDeleteOrder = async (orderId) => {
  Alert.alert(
    'Delete Order',
    'Are you sure you want to delete this completed order?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'orders', orderId));
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to delete order');
          }
        },
      },
    ]
  );
};



  const handleToggleStatus = async (order) => {
    const nextStatus =
      order.status === 'in-progress' ? 'completed' : 'in-progress';

    try {
      await updateOrderStatus(order.id, nextStatus);
    } catch (e) {
      console.error(e);
      alert('Failed to update status: ' + e.message);
    }
  };

  const renderOrder = ({ item }) => {
  const itemsSummary = item.items
    ? item.items.map((i) => `${i.name} x${i.quantity}`).join(', ')
    : '';

  const isCompleted = item.status === 'completed';

  const handlePress = () => {
    if (isCompleted) {
      handleDeleteOrder(item.id); // ✅ DELETE WITH CONFIRMATION
    } else {
      handleToggleStatus(item);   // ✅ NORMAL STATUS TOGGLE
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.orderCard,
        isCompleted && styles.orderCardCompleted,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.orderTitle}>Table {item.tableRef}</Text>
        <Text style={styles.orderStatus}>Status: {item.status}</Text>

        {itemsSummary ? (
          <Text style={styles.orderItems}>{itemsSummary}</Text>
        ) : null}

        {item.notes ? (
          <Text style={styles.orderNotes}>Notes: {item.notes}</Text>
        ) : null}

        {isCompleted && (
          <Text style={styles.deleteHint}>Tap to delete</Text>
        )}
      </View>

      <Text style={styles.orderIcon}>
        {item.status === 'in-progress' ? '⏳' : '✅'}
      </Text>
    </TouchableOpacity>
  );
};


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Orders</Text>
      <Text style={styles.roleText}>Current role: {role}</Text>

     

      
      {(role === 'staff' || role == 'admin') &&  (
       <View style={styles.buttonRow}>
    <TouchableOpacity
      style={styles.newOrderButton}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('NewOrderSelectTable', {
          role,
          userId,
        })
      }
    >
      <Text style={styles.newOrderButtonText}>➕ New Order</Text>
    </TouchableOpacity>
    <TouchableOpacity
  style={styles.homeButton}
  activeOpacity={0.85}
  onPress={() => {
    const target =
      role === 'admin' ? 'AdminHomeScreen' : 'StaffHomeScreen';

    navigation.reset({
      index: 0,
      routes: [
        {
          name: target,
          params: { userId, role },
        },
      ],
    });
  }}
>
  <Text style={styles.homeButtonText}>🏠 Home</Text>
</TouchableOpacity>

  </View>
)}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={
          orders.length === 0 && styles.emptyListContainer
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No orders yet.</Text>
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
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  buttonRow: {
    marginBottom: 12,
    gap : 10,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderStatus: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
  },
  orderItems: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  orderNotes: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  orderIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  orderCardCompleted: {
  backgroundColor: '#f3f3f3',
},

deleteHint: {
  marginTop: 6,
  fontSize: 12,
  color: '#c0392b',
  fontWeight: '600',
},
newOrderButton: {
  backgroundColor: '#083944',   // ✅ your app teal
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 3,                 // ✅ Android shadow
},

newOrderButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
  letterSpacing: 0.3,
},
homeButton: {
  backgroundColor: '#083944',   // ✅ your app teal
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 3, 
},

homeButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
  letterSpacing: 0.3,
},


});
