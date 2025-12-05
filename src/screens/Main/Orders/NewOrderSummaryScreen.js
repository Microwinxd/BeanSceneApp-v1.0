// src/screens/Main/Orders/NewOrderSummaryScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { createOrder } from '../../../services/ordersService';
import NetInfo from '@react-native-community/netinfo';
import { saveOfflineOrder } from './../../../services/OfflineOrderService';


export default function NewOrderSummaryScreen({ navigation, route }) {
  const role = route?.params?.role ?? 'staff';
  const userId = route?.params?.userId ?? null;
  const tableRef = route?.params?.tableRef ?? null;
  const items = route?.params?.items ?? [];

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0,
      ),
    [items],
  );

  const handleConfirm = async () => {
  if (!userId || !tableRef || items.length === 0) {
    alert('Missing data for order.');
    return;
  }

  const orderData = {
    tableRef,
    items,
    notes,
    userId,
    total: Number(total.toFixed(2)),
    status: 'pending',
    createdAt: new Date(),
  };

  try {
    setSubmitting(true);

    const net = await NetInfo.fetch();

    if (net.isConnected) {
      // ✅ ONLINE → SEND NOW
      await createOrder(orderData);
    } else {
      // ✅ OFFLINE → SAVE LOCALLY
      await saveOfflineOrder(orderData);
      alert('⚠ Offline mode: Order saved and will sync automatically.');
    }

    navigation.navigate('OrdersList', { role, userId });
  } catch (e) {
    console.error('Failed to create order:', e);
    alert('Failed to create order: ' + e.message);
  } finally {
    setSubmitting(false);
  }
};



  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>
          {item.name} x{item.quantity}
        </Text>
        <Text style={styles.itemPrice}>
          ${item.price?.toFixed(2)} each
        </Text>
      </View>
      <Text style={styles.itemTotal}>
        ${(item.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order summary</Text>
      <Text style={styles.subheader}>
        Table {tableRef} · Role: {role}
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.menuItemId}
        renderItem={renderItem}
        contentContainerStyle={styles.itemsList}
      />

      <Text style={styles.totalText}>
        Total: ${total.toFixed(2)}
      </Text>

      <Text style={styles.notesLabel}>Notes for kitchen (optional)</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="e.g. No onion, allergy notes..."
      />

      <View style={styles.footer}>
  <TouchableOpacity
    style={[
      styles.confirmButton,
      submitting && styles.confirmButtonDisabled,
    ]}
    onPress={handleConfirm}
    activeOpacity={0.8}
    disabled={submitting}
  >
    <Text style={styles.confirmButtonText}>
      {submitting ? 'Creating order...' : 'Confirm Order'}
    </Text>
  </TouchableOpacity>
    </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  subheader: { fontSize: 14, color: '#666', marginBottom: 8 },
  itemsList: { paddingBottom: 8 },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  itemName: { fontSize: 16 },
  itemPrice: { fontSize: 13, color: '#666' },
  itemTotal: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
  },
  notesLabel: { fontSize: 14, marginBottom: 4 },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  footer: { marginTop: 12, paddingBottom: 20 },
  confirmButton: {
  backgroundColor: '#083944',
  paddingVertical: 16,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: 12,
  marginBottom: 20,
},

confirmButtonDisabled: {
  backgroundColor: '#ccc',
},

confirmButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},

});
