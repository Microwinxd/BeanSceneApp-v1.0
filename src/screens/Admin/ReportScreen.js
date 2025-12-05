import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function ReportScreen({ navigation, route }) {
  const role = route?.params?.role ?? 'staff';
  const userId = route?.params?.userId ?? null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [cancelledOrders, setCancelledOrders] = useState(0);

  const loadReports = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(list);
      setTotalOrders(list.length);

      let revenue = 0;
      let completed = 0;
      let cancelled = 0;

      list.forEach((order) => {
        if (order.status === 'completed') {
          completed++;
          revenue += Number(order.total ?? 0);
        }
        if (order.status === 'cancelled') {
          cancelled++;
        }
      });

      setCompletedOrders(completed);
      setCancelledOrders(cancelled);
      setTotalRevenue(revenue);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text>Loading Reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports Dashboard</Text>

      {/* ✅ SUMMARY CARD */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Total Orders: {totalOrders}</Text>
        <Text style={styles.summaryText}>Completed Orders: {completedOrders}</Text>
        <Text style={styles.summaryText}>Cancelled Orders: {cancelledOrders}</Text>

        <Text style={styles.revenueText}>
          Total Revenue: ${totalRevenue.toFixed(2)}
        </Text>
      </View>

      <Text style={styles.subTitle}>Recent Orders</Text>

      {/* ✅ ORDER CARDS (SAME STYLE AS MENU MANAGEMENT) */}
      <FlatList
        data={orders.slice(0, 10)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemTitle}>Order ID</Text>
            <Text style={styles.itemValue}>{item.id}</Text>

            <Text style={styles.itemTitle}>Table</Text>
            <Text style={styles.itemValue}>{item.tableRef}</Text>

            <Text style={styles.itemTitle}>Status</Text>
            <Text
              style={[
                styles.statusBadge,
                item.status === 'completed' && styles.completed,
                item.status === 'cancelled' && styles.cancelled,
              ]}
            >
              {item.status}
            </Text>

            <Text style={styles.itemTitle}>Total</Text>
            <Text style={styles.priceText}>${item.total}</Text>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },

  subTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '600',
  },

  summaryCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 18,
    borderRadius: 10,
    backgroundColor: '#fafafa',
  },

  summaryText: {
    fontSize: 18,
    marginBottom: 6,
  },

  revenueText: {
    marginTop: 10,
    fontWeight: '700',
    fontSize: 20,
    color: '#083944',
  },

  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
    backgroundColor: '#fafafa',
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    marginTop: 6,
  },

  itemValue: {
    fontSize: 16,
  },

  priceText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },

  statusBadge: {
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#7f8c8d',
  },

  completed: {
    backgroundColor: '#27ae60',
  },

  cancelled: {
    backgroundColor: '#e74c3c',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
