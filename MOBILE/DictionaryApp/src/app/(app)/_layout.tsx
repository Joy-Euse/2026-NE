import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';

export default function AppDrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: '#2457d6',
        drawerInactiveTintColor: '#526173',
        drawerLabelStyle: { fontWeight: '800' },
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#121826',
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
