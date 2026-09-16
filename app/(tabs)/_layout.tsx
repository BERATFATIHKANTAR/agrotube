import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [hasUser, setHasUser] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (isMounted) {
          setHasUser(!!storedUser);
          setIsReady(true);
        }
      } catch (e) {
        if (isMounted) {
          setHasUser(false);
          setIsReady(true);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady || hasUser === null) return;

    const firstSegment = (segments[0] as string) || '';

    const inAuthGroup = firstSegment === 'auth';
    const inOnboardingGroup = firstSegment === 'onboarding';
    // Boş segment veya 'index' ise Splash ekranındayız
    const isIndexPage = firstSegment === '' || firstSegment === 'index';

    // Oturum varsa ve kullanıcı Splash/Auth sayfalarındaysa içeri al
    if (hasUser && (inAuthGroup || isIndexPage)) {
      router.replace('/(tabs)' as any);
      return;
    }

    // Oturum yoksa VE Splash/Auth/Onboarding sayfalarında DEĞİLSE Login'e at
    // (isIndexPage true olduğu için Splash ekranında otomatik atma yapmaz)
    if (!hasUser && !inAuthGroup && !inOnboardingGroup && !isIndexPage) {
      router.replace('/auth/login' as any);
    }
  }, [hasUser, isReady, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F5F0' }}>
        <ActivityIndicator size="large" color="#0F382C" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}