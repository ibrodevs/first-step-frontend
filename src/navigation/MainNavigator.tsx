import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { InternshipDetailsScreen } from '../screens/InternshipDetailsScreen';
import { Colors, Theme } from '../constants/colors';
import { useAuthStore } from '../store/authStore';
import { Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApplicationsScreen } from '../screens/ApplicationsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const FavoritesScreen = () => (
  <SafeAreaView style={styles.placeholderContainer}>
    <View style={styles.placeholderContent}>
      <View style={styles.placeholderIcon}>
        <Feather name="heart" size={48} color={Colors.accent} />
      </View>
      <Text style={styles.placeholderTitle}>Избранное</Text>
      <Text style={styles.placeholderSubtitle}>
        Сохраняйте интересные стажировки в избранное
      </Text>
      <TouchableOpacity style={styles.placeholderButton}>
        <Text style={styles.placeholderButtonText}>Скоро доступно</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const MyInternshipsScreen = () => (
  <SafeAreaView style={styles.placeholderContainer}>
    <View style={styles.placeholderContent}>
      <View style={styles.placeholderIcon}>
        <Feather name="briefcase" size={48} color={Colors.accent} />
      </View>
      <Text style={styles.placeholderTitle}>Мои стажировки</Text>
      <Text style={styles.placeholderSubtitle}>
        Управляйте своими стажировками и кандидатами
      </Text>
      <TouchableOpacity style={styles.placeholderButton}>
        <Text style={styles.placeholderButtonText}>Скоро доступно</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const StudentTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.secondary + '20',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Главная',
          tabBarIcon: ({ focused, color, size }) => (
            <Feather
              name={focused ? 'home' : 'home'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{
          title: 'Заявки',
          tabBarIcon: ({ focused, color, size }) => (
            <Feather
              name={focused ? 'file-text' : 'file'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Избранное',
          tabBarIcon: ({ focused, color, size }) => (
            <Feather
              name={focused ? 'heart' : 'heart'}
              size={24}
              color={focused ? Colors.accent : color}
              style={{
                opacity: focused ? 1 : 0.7,
                transform: [{ scale: focused ? 1.1 : 1 }]
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профиль',
          tabBarIcon: ({ focused, color, size }) => (
            <Feather
              name={focused ? 'user' : 'user'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const StudentNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="StudentTabs" component={StudentTabs} />
      <Stack.Screen name="InternshipDetails" component={InternshipDetailsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

const EmployerTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.secondary + '20',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Главная',
          tabBarIcon: ({ focused, color, size }) => (
            <Feather
              name={focused ? 'home' : 'home'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyInternships"
        component={MyInternshipsScreen}
        options={{
          title: 'Стажировки',
          tabBarIcon: ({ focused, color, size }) => (
            <Feather
              name={focused ? 'briefcase' : 'briefcase'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профиль',
          tabBarIcon: ({ focused, color, size }) => (
            <Feather
              name={focused ? 'user' : 'user'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const EmployerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="EmployerTabs" component={EmployerTabs} />
      <Stack.Screen name="InternshipDetails" component={InternshipDetailsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  const { user } = useAuthStore();

  return user?.role === 'employer' ? <EmployerNavigator /> : <StudentNavigator />;
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  placeholderIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.lightAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.xl,
  },
  placeholderButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.large,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  placeholderButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});