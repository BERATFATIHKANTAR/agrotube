import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 40;

// Slider Veri Yapısı (Mat Renk Paleti - 4 Bannerlı)
const SLIDER_DATA = [
  {
    id: '1',
    route: '/tasks',
    title: 'Günün Görevleri',
    subtitle: 'İşlerinizi saat saat planlayın, zamanı geldiğinde bildirimlerle hatırlatalım.',
    btnText: 'Görevleri Zamanla',
    image: 'https://cdn-icons-png.flaticon.com/512/3058/3058995.png',
    bgColor: '#1E382B',
  },
  {
    id: '2',
    route: '/calendar',
    title: 'Tarım Takvimi',
    subtitle: 'Aylık ekim, dikim, hasat ve ilaçlama rehberini inceleyin.',
    btnText: 'Takvimi Gör',
    image: 'https://cdn-icons-png.flaticon.com/512/628/628283.png',
    bgColor: '#2E4C3E',
  },
  {
    id: '3',
    route: '/(tabs)/crop-recommendation', // Tabs altındaki ilgili yönlendirme sayfası
    title: 'Tarlaya Ne Ekmeliyim?',
    subtitle: 'Toprak analiz değerlerinize ve mevsime göre en verimli ürünü keşfedin.',
    btnText: 'Ürün Analizi Yap',
    image: 'https://cdn-icons-png.flaticon.com/512/188/188333.png',
    bgColor: '#284E3A',
  },
  {
    id: '4',
    route: '/profile',
    title: 'Profilinizi Tamamlayın',
    subtitle: 'Sizi tanımamıza yardımcı olun; traktör, ekipman ve arazi verilerinizi tamamlayın.',
    btnText: 'Profili Güncelle',
    image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    bgColor: '#3A5A4A',
  },
];

// Görseldeki Rotalara Birebir Uyumlu İşlem Kartları
const QUICK_ACTIONS = {
  gorevlerim: [
    { id: '1', route: '/tasks', title: 'Günün Görevleri', sub: 'Saatlik Plan & Bildirim', tag: 'Planlama', icon: 'https://cdn-icons-png.flaticon.com/512/3058/3058995.png' },
    { id: '2', route: '/calendar', title: 'Tarım Takvimi', sub: 'Ekim, Hasat & İlaçlama', tag: 'Rehber', icon: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png' },
  ],
  tarlalarim: [
    { id: '1', route: '/fields', title: 'Tarlalarım', sub: 'Kayıtlı Parseller', tag: 'Detayları Gör', icon: 'https://cdn-icons-png.flaticon.com/512/628/628283.png' },
    { id: '2', route: '/add', title: 'Hızlı Ekle', sub: 'Yeni Tarla & Varlık Tanımla', tag: 'Hızlı Ekle', icon: 'https://cdn-icons-png.flaticon.com/512/3058/3058995.png' },
  ],
  hayvanlarim: [
    { id: '1', route: '/livestock', title: 'Büyükbaş & Küçükbaş', sub: 'Küpe & Sürü Takibi', tag: 'Sürü Yönetimi', icon: 'https://cdn-icons-png.flaticon.com/512/1998/1998611.png' },
    { id: '2', route: '/ration', title: 'Rasyon Hesabı', sub: 'Günlük Yem & Protein', tag: 'Yem Karma', icon: 'https://cdn-icons-png.flaticon.com/512/2304/2304772.png' },
  ],
  araclarim: [
    { id: '1', route: '/vehicles', title: 'Traktör & Ekipman', sub: 'Bakım & Yakıt Takibi', tag: 'Garaj', icon: 'https://cdn-icons-png.flaticon.com/512/2554/2554936.png' },
    { id: '2', route: '/add', title: 'Araç / Gider Ekle', sub: 'Mazot & Parça Gideri', tag: 'Maliyet', icon: 'https://cdn-icons-png.flaticon.com/512/2823/2823531.png' },
  ],
  havadurumu: [
    { id: '1', route: '/weather', title: 'Detaylı Tahmin', sub: '7 Günlük Hava Durumu', tag: 'Rüzgar & Nem', icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png' },
    { id: '2', route: '/spray', title: 'İlaçlama Takvimi', sub: 'Rüzgar ve Yağış Riski', tag: 'Tarım Analiz', icon: 'https://cdn-icons-png.flaticon.com/512/3058/3058995.png' },
  ],
};

type CategoryKey = 'gorevlerim' | 'tarlalarim' | 'hayvanlarim' | 'araclarim' | 'havadurumu';

export default function HomeScreen() {
  const router = useRouter();
  const sliderRef = useRef<ScrollView>(null);

  // State'ler
  const [userName, setUserName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [loadingFields, setLoadingFields] = useState(true);

  // Hava Durumu State'leri
  const [weatherData, setWeatherData] = useState<{ temp: number; code: number } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('gorevlerim');
  const [fieldModalVisible, setFieldModalVisible] = useState(false);

  // Pop-up Menü State'i
  const [quickAddMenuVisible, setQuickAddMenuVisible] = useState(false);

 const API_URL = 'http://10.38.183.165:5001';
  // 1. Veri Yükleme
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser && isMounted) {
          const parsedUser = JSON.parse(storedUser);
          const userId = parsedUser.id || parsedUser.user?.id;

          let displayName = parsedUser.email ? parsedUser.email.split('@')[0] : 'Çiftçi';

          if (userId) {
            try {
              const profileRes = await fetch(`${API_URL}/profile/${userId}`);
              const profileData = await profileRes.json();
              
              if (profileRes.ok && profileData) {
                if (profileData.full_name?.trim()) {
                  displayName = profileData.full_name.trim();
                }
                if (profileData.avatar_url) {
                  setAvatarUrl(profileData.avatar_url);
                }
              }
            } catch (err) {
              console.log('Profil bilgileri çekilemedi, varsayılan kullanılıyor.');
            }

            const fieldRes = await fetch(`${API_URL}/fields/${userId}`);
            const fieldData = await fieldRes.json();

            if (fieldRes.ok && isMounted) {
              setFields(fieldData);
              if (fieldData.length > 0) {
                setSelectedField(fieldData[0]);
              }
            }
          }

          if (isMounted) setUserName(displayName);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        if (isMounted) setLoadingFields(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  // 2. Canlı Hava Durumu
  useEffect(() => {
    let isMounted = true;

    const fetchLiveWeather = async () => {
      setLoadingWeather(true);
      try {
        let lat = 40.5506;
        let lon = 34.9556;

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const data = await response.json();

        if (data?.current_weather && isMounted) {
          setWeatherData({
            temp: Math.round(data.current_weather.temperature),
            code: data.current_weather.weathercode,
          });
        }
      } catch (error) {
        console.error('Hava durumu verisi çekilemedi:', error);
      } finally {
        if (isMounted) setLoadingWeather(false);
      }
    };

    fetchLiveWeather();
    return () => { isMounted = false; };
  }, [selectedField]);

  // Otomatik Slider
  useEffect(() => {
    const timer = setInterval(() => {
      let nextSlide = activeSlide + 1;
      if (nextSlide >= SLIDER_DATA.length) nextSlide = 0;
      
      sliderRef.current?.scrollTo({
        x: nextSlide * BANNER_WIDTH,
        animated: true,
      });
      setActiveSlide(nextSlide);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeSlide]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / BANNER_WIDTH);
    if (currentIndex !== activeSlide) {
      setActiveSlide(currentIndex);
    }
  };

  const handleQuickNavigate = (route: string) => {
    setFieldModalVisible(false);
    setQuickAddMenuVisible(false);
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B3B2B" />

      {/* 1. ÜST HEADER ALANI */}
      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.locationLabel}>
              Hoş Geldin, {userName || 'Çiftçi'} 👋
            </Text>
            <TouchableOpacity 
              style={styles.locationSelector}
              onPress={() => setFieldModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={16} color="#E2D8C3" style={{ marginRight: 4 }} />
              <Text style={styles.locationText}>
                {selectedField ? selectedField.name : 'Tarla Seç / Ekle +'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* DİNAMİK PROFİL FOTOĞRAFI / AVATAR */}
          <TouchableOpacity onPress={() => router.push('/profile' as any)} activeOpacity={0.8}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={22} color="#1B3B2B" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* CANLI HAVA DURUMU KARTI */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherLeftGroup}>
            <Ionicons name="sunny" size={24} color="#E8C372" />
            {loadingWeather ? (
              <ActivityIndicator size="small" color="#FFF" style={{ marginLeft: 8 }} />
            ) : (
              <Text style={styles.weatherTemp}>
                {weatherData ? `${weatherData.temp}°C` : '24°C'}
              </Text>
            )}
            <Text style={styles.weatherStatus}>
              {selectedField?.location ? selectedField.location : 'Çorum / Merkez'}
            </Text>
          </View>
        </View>

        {/* SEARCH BAR & FİLTRE */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#A2B59F" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="İlaç, gübre veya tarlalarında ara..."
              placeholderTextColor="#A2B59F"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
            <Ionicons name="options-outline" size={22} color="#1B3B2B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 2. SLIDER BANNER */}
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={sliderRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={32}
            decelerationRate="fast"
            snapToInterval={BANNER_WIDTH}
            snapToAlignment="center"
            disableIntervalMomentum={true}
          >
            {SLIDER_DATA.map((item) => (
              <View key={item.id} style={[styles.heroBanner, { backgroundColor: item.bgColor }]}>
                <View style={styles.heroTextContainer}>
                  <Text style={styles.heroTitle}>{item.title}</Text>
                  <Text style={styles.heroSubtitle} numberOfLines={2}>{item.subtitle}</Text>
                  <TouchableOpacity 
                    style={styles.heroBtn} 
                    activeOpacity={0.85}
                    onPress={() => router.push(item.route as any)}
                  >
                    <Text style={styles.heroBtnText}>{item.btnText}</Text>
                  </TouchableOpacity>
                </View>
                <Image source={{ uri: item.image }} style={styles.heroImage} />
              </View>
            ))}
          </ScrollView>

          {/* Slider Noktaları */}
          <View style={styles.paginationDots}>
            {SLIDER_DATA.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeSlide === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 3. KATEGORİ SEÇİM ALANI */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
        </View>

        <View style={styles.fittedCategoriesRow}>
          {/* Görevlerim */}
          <TouchableOpacity 
            style={styles.fittedCategoryItem} 
            onPress={() => setSelectedCategory('gorevlerim')}
            activeOpacity={0.8}
          >
            <View style={[styles.categoryIconCircle, selectedCategory === 'gorevlerim' ? styles.activeCategoryBg : styles.passiveCategoryBg]}>
              <Ionicons name="checkbox-outline" size={20} color={selectedCategory === 'gorevlerim' ? '#FFF' : '#2D4A3A'} />
            </View>
            <Text numberOfLines={1} style={[styles.categoryText, selectedCategory === 'gorevlerim' && styles.activeCategoryText]}>Görevler</Text>
          </TouchableOpacity>

          {/* Tarlalarım */}
          <TouchableOpacity 
            style={styles.fittedCategoryItem} 
            onPress={() => setSelectedCategory('tarlalarim')}
            activeOpacity={0.8}
          >
            <View style={[styles.categoryIconCircle, selectedCategory === 'tarlalarim' ? styles.activeCategoryBg : styles.passiveCategoryBg]}>
              <MaterialCommunityIcons name="sprout" size={20} color={selectedCategory === 'tarlalarim' ? '#FFF' : '#2D4A3A'} />
            </View>
            <Text numberOfLines={1} style={[styles.categoryText, selectedCategory === 'tarlalarim' && styles.activeCategoryText]}>Tarlalar</Text>
          </TouchableOpacity>

          {/* Hayvanlarım */}
          <TouchableOpacity 
            style={styles.fittedCategoryItem} 
            onPress={() => setSelectedCategory('hayvanlarim')}
            activeOpacity={0.8}
          >
            <View style={[styles.categoryIconCircle, selectedCategory === 'hayvanlarim' ? styles.activeCategoryBg : styles.passiveCategoryBg]}>
              <FontAwesome5 name="cow" size={18} color={selectedCategory === 'hayvanlarim' ? '#FFF' : '#2D4A3A'} />
            </View>
            <Text numberOfLines={1} style={[styles.categoryText, selectedCategory === 'hayvanlarim' && styles.activeCategoryText]}>Hayvanlar</Text>
          </TouchableOpacity>

          {/* Araçlarım */}
          <TouchableOpacity 
            style={styles.fittedCategoryItem} 
            onPress={() => setSelectedCategory('araclarim')}
            activeOpacity={0.8}
          >
            <View style={[styles.categoryIconCircle, selectedCategory === 'araclarim' ? styles.activeCategoryBg : styles.passiveCategoryBg]}>
              <MaterialCommunityIcons name="tractor" size={20} color={selectedCategory === 'araclarim' ? '#FFF' : '#2D4A3A'} />
            </View>
            <Text numberOfLines={1} style={[styles.categoryText, selectedCategory === 'araclarim' && styles.activeCategoryText]}>Araçlar</Text>
          </TouchableOpacity>

          {/* Hava Durumu */}
          <TouchableOpacity 
            style={styles.fittedCategoryItem} 
            onPress={() => setSelectedCategory('havadurumu')}
            activeOpacity={0.8}
          >
            <View style={[styles.categoryIconCircle, selectedCategory === 'havadurumu' ? styles.activeCategoryBg : styles.passiveCategoryBg]}>
              <Ionicons name="partly-sunny" size={20} color={selectedCategory === 'havadurumu' ? '#FFF' : '#2D4A3A'} />
            </View>
            <Text numberOfLines={1} style={[styles.categoryText, selectedCategory === 'havadurumu' && styles.activeCategoryText]}>Hava</Text>
          </TouchableOpacity>
        </View>

        {/* 4. DİNAMİK İŞLEM KARTLARI */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>İşlemler & Hesaplar</Text>
        </View>

        <View style={styles.gridRow}>
          {QUICK_ACTIONS[selectedCategory].map((action: { id: string; route: string; title: string; sub: string; tag: string; icon: string }) => (
            <TouchableOpacity 
              key={action.id} 
              style={styles.gridCard} 
              activeOpacity={0.9}
              onPress={() => router.push(action.route as any)}
            >
              <Image source={{ uri: action.icon }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{action.title}</Text>
                <Text style={styles.cardSub}>{action.sub}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>{action.tag}</Text>
                  </View>
                  <View style={styles.arrowCircle}>
                    <Ionicons name="chevron-forward" size={16} color="#FFF" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* TARLA SEÇİM MODALI */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={fieldModalVisible}
        onRequestClose={() => setFieldModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setFieldModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tarlalarım</Text>
              <TouchableOpacity onPress={() => setFieldModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#8D9E8B" />
              </TouchableOpacity>
            </View>

            {loadingFields ? (
              <ActivityIndicator size="small" color="#2D4A3A" style={{ marginVertical: 20 }} />
            ) : fields.length > 0 ? (
              fields.map((field) => (
                <TouchableOpacity
                  key={field.id}
                  style={[
                    styles.fieldSelectItem,
                    selectedField?.id === field.id && styles.activeFieldItem,
                  ]}
                  onPress={() => {
                    setSelectedField(field);
                    setFieldModalVisible(false);
                  }}
                >
                  <View>
                    <Text style={styles.fieldName}>{field.name}</Text>
                    <Text style={styles.fieldSub}>{field.location} • {field.size} ({field.crop})</Text>
                  </View>
                  {selectedField?.id === field.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#2D4A3A" />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ textAlign: 'center', color: '#666', marginVertical: 15 }}>
                Henüz kayıtlı bir tarlanız bulunmuyor.
              </Text>
            )}

            <TouchableOpacity 
              style={styles.modalAddFieldBtn} 
              activeOpacity={0.85}
              onPress={() => handleQuickNavigate('/add')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.modalAddFieldBtnText}>YENİ TARLA EKLE</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* POP-UP YELPAZE MENÜ MODALI */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={quickAddMenuVisible}
        onRequestClose={() => setQuickAddMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.arcMenuOverlay} 
          activeOpacity={1} 
          onPress={() => setQuickAddMenuVisible(false)}
        >
          <View style={styles.arcMenuWrapper}>
            
            {/* 1. Tarla Ekle (add.tsx) */}
            <TouchableOpacity 
              style={[styles.arcMenuItem, styles.posTopLeft]} 
              onPress={() => handleQuickNavigate('/add')}
              activeOpacity={0.85}
            >
              <View style={styles.arcIconCircle}>
                <MaterialCommunityIcons name="sprout" size={24} color="#2D4A3A" />
              </View>
              <Text style={styles.arcItemText}>Tarla Ekle</Text>
            </TouchableOpacity>

            {/* 2. Hayvanlar (livestock.tsx) */}
            <TouchableOpacity 
              style={[styles.arcMenuItem, styles.posTopCenter]} 
              onPress={() => handleQuickNavigate('/livestock')}
              activeOpacity={0.85}
            >
              <View style={styles.arcIconCircle}>
                <FontAwesome5 name="cow" size={20} color="#2D4A3A" />
              </View>
              <Text style={styles.arcItemText}>Hayvanlar</Text>
            </TouchableOpacity>

            {/* 3. Araçlar (vehicles.tsx) */}
            <TouchableOpacity 
              style={[styles.arcMenuItem, styles.posTopRight]} 
              onPress={() => handleQuickNavigate('/vehicles')}
              activeOpacity={0.85}
            >
              <View style={styles.arcIconCircle}>
                <MaterialCommunityIcons name="tractor" size={24} color="#2D4A3A" />
              </View>
              <Text style={styles.arcItemText}>Araçlar</Text>
            </TouchableOpacity>

            {/* 4. Görev Ekle (tasks.tsx) */}
            <TouchableOpacity 
              style={[styles.arcMenuItem, styles.posPeakCenter]} 
              onPress={() => handleQuickNavigate('/tasks')}
              activeOpacity={0.85}
            >
              <View style={styles.arcIconCircle}>
                <Ionicons name="checkbox-outline" size={24} color="#2D4A3A" />
              </View>
              <Text style={styles.arcItemText}>Görev Ekle</Text>
            </TouchableOpacity>

            {/* Kapat Butonu */}
            <TouchableOpacity 
              style={styles.arcCloseFab}
              onPress={() => setQuickAddMenuVisible(false)}
              activeOpacity={0.9}
            >
              <Ionicons name="close" size={32} color="#FFF" />
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>

      {/* ALT NAVİGASYON BAR */}
      <View style={styles.bottomFooterNav}>
        <TouchableOpacity style={styles.footerNavItem} onPress={() => router.push('/index' as any)}>
          <Ionicons name="home" size={24} color="#2D4A3A" />
          <Text style={[styles.footerNavText, { color: '#2D4A3A', fontWeight: 'bold' }]}>Ana Sayfa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerNavItem} onPress={() => router.push('/fields' as any)}>
          <MaterialCommunityIcons name="sprout" size={24} color="#7A8E77" />
          <Text style={styles.footerNavText}>Tarlalarım</Text>
        </TouchableOpacity>

        {/* Ortadaki Büyük Hızlı Ekle (+ FAB) */}
        <TouchableOpacity 
          style={styles.footerCenterFab} 
          onPress={() => setQuickAddMenuVisible(true)} 
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerNavItem} onPress={() => router.push('/ration' as any)}>
          <MaterialCommunityIcons name="calculator" size={24} color="#7A8E77" />
          <Text style={styles.footerNavText}>Rasyon</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerNavItem} onPress={() => router.push('/profile' as any)}>
          <Ionicons name="person" size={24} color="#7A8E77" />
          <Text style={styles.footerNavText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  topHeader: {
    backgroundColor: '#1B3B2B',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationLabel: {
    color: '#A2B59F',
    fontSize: 12,
    fontWeight: '500',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E2D8C3',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2D8C3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  weatherLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherTemp: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 10,
  },
  weatherStatus: {
    color: '#A2B59F',
    fontSize: 12,
    fontWeight: '500',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
  },
  filterBtn: {
    width: 46,
    height: 46,
    backgroundColor: '#E2D8C3',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
  },
  sliderContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  heroBanner: {
    width: BANNER_WIDTH,
    borderRadius: 20,
    padding: 18,
    height: 155,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroTextContainer: {
    width: '62%',
    justifyContent: 'center',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 20,
  },
  heroSubtitle: {
    color: '#A2B59F',
    fontSize: 11,
    marginBottom: 12,
  },
  heroBtn: {
    backgroundColor: '#E2D8C3',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    color: '#1B3B2B',
    fontSize: 11,
    fontWeight: 'bold',
  },
  heroImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 10,
    left: 18,
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 6,
  },
  activeDot: {
    backgroundColor: '#FFF',
    width: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1B3B2B',
  },
  fittedCategoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  fittedCategoryItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 40) / 5 - 4,
  },
  categoryIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeCategoryBg: {
    backgroundColor: '#2D4A3A',
  },
  passiveCategoryBg: {
    backgroundColor: '#E2E8E0',
  },
  categoryText: {
    fontSize: 11,
    color: '#556652',
    fontWeight: '600',
    textAlign: 'center',
  },
  activeCategoryText: {
    color: '#2D4A3A',
    fontWeight: 'bold',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#2D4A3A',
    borderRadius: 20,
    padding: 12,
    justifyContent: 'space-between',
    height: 210,
  },
  cardImage: {
    width: '100%',
    height: 85,
    resizeMode: 'contain',
    marginTop: 2,
  },
  cardContent: {
    marginTop: 6,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardSub: {
    color: '#A2B59F',
    fontSize: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceTag: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B3B2B',
  },
  fieldSelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F2EB',
    marginBottom: 10,
  },
  activeFieldItem: {
    borderWidth: 1.5,
    borderColor: '#2D4A3A',
    backgroundColor: '#E2E8E0',
  },
  fieldName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },
  fieldSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  modalAddFieldBtn: {
    backgroundColor: '#2D4A3A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    marginTop: 10,
  },
  modalAddFieldBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  arcMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 59, 43, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  arcMenuWrapper: {
    width: 320,
    height: 320,
    bottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  arcMenuItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arcIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2D8C3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  arcItemText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  posTopLeft: {
    bottom: 135,
    left: 20,
  },
  posTopCenter: {
    bottom: 215,
    left: 80,
  },
  posTopRight: {
    bottom: 135,
    right: 20,
  },
  posPeakCenter: {
    bottom: 215,
    right: 80,
  },
  arcCloseFab: {
    position: 'absolute',
    bottom: 15,
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#C85A54',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  bottomFooterNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2ECE9',
    paddingHorizontal: 12,
    paddingBottom: 6,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  footerNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  footerNavText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7A8E77',
    marginTop: 3,
  },
  footerCenterFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2D4A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -26,
    elevation: 6,
    shadowColor: '#2D4A3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});