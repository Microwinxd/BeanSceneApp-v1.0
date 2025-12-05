// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/Auth/LoginScreen';
import OrdersListScreen from '../screens/Main/Orders/OrdersListScreen';
import MenuListScreen from '../screens/Main/Menu/MenuListScreen';
import NewOrderSelectTableScreen from '../screens/Main/Orders/NewOrderSelectTableScreen';
import NewOrderSelectItemsScreen from '../screens/Main/Orders/NewOrderSelectItemsScreen';
import NewOrderSummaryScreen from '../screens/Main/Orders/NewOrderSummaryScreen';
import StaffHomeScreen from '../screens/Main/Staff/StaffHomeScreen';
import AdminHomeScreen from '../screens/Admin/AdminHomeScreen';
import ManageMenuScreen from '../screens/Main/Menu/ManageMenuScreen';
import ManageStaffScreen from '../screens/Main/Staff/ManageStaffScreen';
import ReportScreen from '../screens/Admin/ReportScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen
          name="OrdersList"
          component={OrdersListScreen}
          options={{ title: 'Orders' }}
        />
        <Stack.Screen
          name="MenuList"
          component={MenuListScreen}
          options={{ title: 'Menu' }}
        />
        <Stack.Screen
        name="NewOrderSelectTable"
        component={NewOrderSelectTableScreen}
        options={{ title: 'New Order - Table' }}
        />
        <Stack.Screen
        name="NewOrderSelectItems"
        component={NewOrderSelectItemsScreen}
        options={{ title: 'New Order - Items' }}
        />
        <Stack.Screen
        name="NewOrderSummary"
        component={NewOrderSummaryScreen}
        options={{ title: 'New Order - Summary' }}
        />
       
        <Stack.Screen
        name="StaffHomeScreen"
        component={StaffHomeScreen}
        options={{ title: 'Home' }}
        />
        <Stack.Screen
        name="AdminHomeScreen"
        component={AdminHomeScreen}
        options={{ title: 'Home' }}
        />
        <Stack.Screen
        name="ManageMenuScreen"
        component={ManageMenuScreen}
        options={{ title: 'Manage Menu' }}
        />
        <Stack.Screen
        name="ManageStaffScreen"
        component={ManageStaffScreen}
        options={{ title: 'Manage Staff' }}
        />
        <Stack.Screen
        name="ReportScreen"
        component={ReportScreen}
        options={{ title: 'Reports' }}
        />
      </Stack.Navigator>

    </NavigationContainer>
  );
}