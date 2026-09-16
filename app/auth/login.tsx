import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State'leri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Unmount kontrolü (Maximum update depth / Unmount state crash engeli)
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Backend Sunucu IP Adresi
  const API_URL = 'http://10.38.183.165:5001';

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }

    setLoading(true);

    if (activeTab === 'register') {
      // KAYIT OL İŞLEMİ
      try {
        const response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Kayıt Başarılı:', data);
          await AsyncStorage.setItem('tempUser', JSON.stringify(data));
          
          // Kayıt sonrası Onboarding adımına yönlendir
          router.replace('/onboarding/farmer-info' as any);
        } else {
          if (isMounted.current) {
            Alert.alert('Kayıt Başarısız', data.error || 'Bir hata oluştu.');
          }
        }
      } catch (error) {
        console.error('Sunucu Bağlantı Hatası:', error);
        if (isMounted.current) {
          Alert.alert('Bağlantı Hatası', 'Backend sunucusuna ulaşılamadı. Sunucunun çalıştığından emin olun.');
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    } else {
      // GİRİŞ YAP İŞLEMİ
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Giriş Başarılı:', data.user);
          // 1. Oturumu kaydet
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          
          // 2. Doğrudan index2 sayfasına yönlendir (klasör çakışmasını engeller)
          router.replace('/index2' as any);
        } else {
          if (isMounted.current) {
            Alert.alert('Giriş Başarısız', data.error || 'E-posta veya şifre hatalı.');
          }
        }
      } catch (error) {
        console.error('Sunucu Bağlantı Hatası:', error);
        if (isMounted.current) {
          Alert.alert('Bağlantı Hatası', 'Backend sunucusuna ulaşılamadı. Sunucunun çalıştığından emin olun.');
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Üst Kısım: Tarla Arka Planı ve Logo */}
      <View style={styles.headerArea}>
        <ImageBackground
          source={{
            uri: 'https://images.pexels.com/photos/38477548/pexels-photo-38477548/free-photo-of-turk-tarlasinda-bugday-hasadi.jpeg?cs=tinysrgb&dpr=1&w=500',
          }}
          style={styles.backgroundImage}
          imageStyle={{ opacity: 0.35 }}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.logoContainer}>
              <View style={styles.leafIconContainer}>
                <MaterialCommunityIcons name="leaf" size={44} color="#33691E" style={styles.leafMain} />
                <MaterialCommunityIcons name="leaf" size={30} color="#558B2F" style={styles.leafSecondary} />
              </View>
              <Text style={styles.logoText}>agrotube</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Alt Kısım: Form Beyaz Kartı */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sekme Geçişi (Tabs) */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => setActiveTab('login')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'login' && styles.activeTabText,
                  ]}
                >
                  GİRİŞ YAP
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'register' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('register')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'register' && styles.activeTabText,
                  ]}
                >
                  KAYIT OL
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Alanları */}
            <View style={styles.inputSection}>
              {/* E-posta */}
              <Text style={styles.label}>E-posta</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="E-posta"
                  placeholderTextColor="#A0AEC0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color="#A0AEC0"
                />
              </View>

              {/* Şifre */}
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Şifre"
                  placeholderTextColor="#A0AEC0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#A0AEC0"
                  />
                </TouchableOpacity>
              </View>

              {/* Şifremi Unuttum */}
              {activeTab === 'login' && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    Şifremi Unuttum?
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Ana Buton */}
            <TouchableOpacity
              style={styles.mainButton}
              activeOpacity={0.85}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.mainButtonText}>
                  {activeTab === 'login' ? 'OTURUM AÇ' : 'KAYDOL VE DEVAM ET'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Google ile Devam Et */}
            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.85}
            >
              <FontAwesome name="google" size={18} color="#EA4335" />
              <Text style={styles.googleButtonText}>Google ile Devam Et</Text>
            </TouchableOpacity>

            {/* Alt Navigasyon Yönlendirmesi */}
            <View style={styles.footerLinkContainer}>
              <Text style={styles.footerText}>
                {activeTab === 'login'
                  ? 'HESABIN YOK MU? '
                  : 'ZATEN HESABIN VAR MI? '}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setActiveTab(activeTab === 'login' ? 'register' : 'login')
                }
              >
                <Text style={styles.footerLink}>
                  {activeTab === 'login' ? 'KAYIT OL' : 'GİRİŞ YAP'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F8F5',
  },
  headerArea: {
    height: '26%',
    width: '100%',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(232, 248, 245, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafIconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  leafMain: {
    transform: [{ rotate: '-15deg' }],
  },
  leafSecondary: {
    transform: [{ rotate: '25deg' }],
    marginLeft: -10,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B5E20',
    letterSpacing: -1,
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00796B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A0AEC0',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#2C3E50',
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2D3748',
    paddingVertical: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: '#00796B',
    fontWeight: '500',
  },
  mainButton: {
    backgroundColor: '#149A9B',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#149A9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  googleButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginLeft: 10,
  },
  footerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#2D3748',
    fontWeight: 'bold',
  },
  footerLink: {
    fontSize: 12,
    color: '#00796B',
    fontWeight: 'bold',
  },
});