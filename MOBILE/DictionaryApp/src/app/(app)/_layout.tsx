import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';

import { AppColors } from '@/constants/appColors';

export default function AppDrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: AppColors.primary,
        drawerInactiveTintColor: AppColors.textSecondary,
        drawerActiveBackgroundColor: AppColors.primarySoft,
        drawerLabelStyle: { fontWeight: '800' },
        headerStyle: { backgroundColor: AppColors.primary },
        headerTintColor: AppColors.onPrimary,
        headerTitleStyle: { color: AppColors.onPrimary, fontWeight: '900' },
        drawerStyle: { backgroundColor: AppColors.card },
      }}>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Home/Search',
          title: 'LexiTech Dictionary',
          drawerIcon: ({ color, size }) => <Ionicons color={color} name="search" size={size} />,
        }}
      />
      <Drawer.Screen
        name="history"
        options={{
          drawerLabel: 'Full Search History',
          title: 'Search History',
          drawerIcon: ({ color, size }) => <Ionicons color={color} name="time" size={size} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile/Account',
          title: 'Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons color={color} name="person-circle" size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="logout"
        options={{
          drawerLabel: 'Logout',
          title: 'Logout',
          drawerIcon: ({ color, size }) => <Ionicons color={color} name="log-out" size={size} />,
        }}
      />
    </Drawer>
  );
}
