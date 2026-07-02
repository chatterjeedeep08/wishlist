import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { WishesProvider } from '../context/WishesContext';
import { useShareIntentSafe } from '../hooks/useShareIntentSafe';
import { extractUrl } from '../services/linkParser';
import { colors } from '../theme';
import {
  AuthStackParamList,
  MainStackParamList,
  PartnerStackParamList,
  TabsParamList,
} from './types';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import PartnerSetupScreen from '../screens/partner/PartnerSetupScreen';
import InvitePartnerScreen from '../screens/partner/InvitePartnerScreen';
import JoinPartnerScreen from '../screens/partner/JoinPartnerScreen';
import HomeScreen from '../screens/main/HomeScreen';
import WishlistScreen from '../screens/main/WishlistScreen';
import AddWishScreen from '../screens/main/AddWishScreen';
import LinkProcessingScreen from '../screens/main/LinkProcessingScreen';
import ManualWishScreen from '../screens/main/ManualWishScreen';
import WishDetailScreen from '../screens/main/WishDetailScreen';
import CompletedWishesScreen from '../screens/main/CompletedWishesScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SubscriptionScreen from '../screens/main/SubscriptionScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const PartnerStack = createNativeStackNavigator<PartnerStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tabs = createBottomTabNavigator<TabsParamList>();

export const navigationRef = createNavigationContainerRef<MainStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function PartnerNavigator() {
  return (
    <PartnerStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitle: '',
      }}
    >
      <PartnerStack.Screen
        name="PartnerSetup"
        component={PartnerSetupScreen}
        options={{ headerShown: false }}
      />
      <PartnerStack.Screen name="InvitePartner" component={InvitePartnerScreen} />
      <PartnerStack.Screen name="JoinPartner" component={JoinPartnerScreen} />
    </PartnerStack.Navigator>
  );
}

const TAB_ICONS: Record<keyof TabsParamList, [string, string]> = {
  Home: ['home', 'home-outline'],
  Wishlist: ['heart', 'heart-outline'],
  Notifications: ['notifications', 'notifications-outline'],
  Profile: ['person', 'person-outline'],
};

function TabsNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name];
          return (
            <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />
          );
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Wishlist" component={WishlistScreen} />
      <Tabs.Screen name="Notifications" component={NotificationsScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

/**
 * Watches for content shared from other apps (Instagram, Amazon, Chrome…)
 * and routes it into the add-wish flow with the link pre-filled.
 */
function ShareIntentGate() {
  const share = useShareIntentSafe();

  useEffect(() => {
    if (!share.hasShareIntent || !navigationRef.isReady()) return;
    const text = share.webUrl ?? share.text ?? '';
    const url = share.webUrl ?? extractUrl(text);
    if (url) {
      navigationRef.navigate('LinkProcessing', {
        url,
        sharedTitle: share.text && share.text !== url ? share.text : undefined,
        fromShare: true,
      });
    } else if (text) {
      navigationRef.navigate('ManualWish', { prefill: { title: text } });
    }
    share.resetShareIntent();
  }, [share.hasShareIntent]);

  return null;
}

function MainNavigator() {
  return (
    <WishesProvider>
      <ShareIntentGate />
      <MainStack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      >
        <MainStack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
        <MainStack.Screen
          name="AddWish"
          component={AddWishScreen}
          options={{ title: 'Add a wish' }}
        />
        <MainStack.Screen
          name="LinkProcessing"
          component={LinkProcessingScreen}
          options={{ title: 'New wish from link' }}
        />
        <MainStack.Screen
          name="ManualWish"
          component={ManualWishScreen}
          options={{ title: 'New wish' }}
        />
        <MainStack.Screen
          name="WishDetail"
          component={WishDetailScreen}
          options={{ title: 'Wish' }}
        />
        <MainStack.Screen
          name="CompletedWishes"
          component={CompletedWishesScreen}
          options={{ title: 'Completed wishes' }}
        />
        <MainStack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{ title: 'Premium' }}
        />
      </MainStack.Navigator>
    </WishesProvider>
  );
}

export default function RootNavigator() {
  const { user, profile, initializing } = useAuth();

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {!user ? (
        <AuthNavigator />
      ) : !profile?.coupleId ? (
        <PartnerNavigator />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
}
