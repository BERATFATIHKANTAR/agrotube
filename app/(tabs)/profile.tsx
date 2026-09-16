import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExpenseBreakdown {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}

export default function ProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profil Form State'leri
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [farmType, setEngineFarmType] = useState('Karma İşletme (Bitkisel + Hayvancılık)');

  // Çiftlik Metrikleri State'leri
  const [totalFields, setTotalFields] = useState<number>(0);
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [totalLivestock, setTotalLivestock] = useState<number>(0);
  const [totalTaskCount, setTotalTaskCount] = useState<number>(0);
  const [completedTaskCount, setCompletedTaskCount] = useState<number>(0);

  // Finansal Metrikler
  const [totalExpensesTL, setTotalExpensesTL] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<ExpenseBreakdown[]>([]);

  const API_URL = 'http://10.38.183.165:5001';

  // Profil Verilerini ve İstatistikleri Çek
  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        setLoading(true);
        const storedUser = await AsyncStorage.getItem('user');
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        const currentUserId = parsed?.id || parsed?.user?.id;

        if (!currentUserId) {
          Alert.alert('Hata', 'Oturum bilgisi bulunamadı.');
          setLoading(false);
          return;
        }

        const numericUserId = Number(currentUserId);
        setUserId(numericUserId);
        setEmail(parsed?.email || parsed?.user?.email || '');

        // 1. Profil Bilgilerini Çek
        try {
          const profileRes = await fetch(`${API_URL}/profile/${numericUserId}`);
          const profileData = await profileRes.json();
          if (profileRes.ok && profileData) {
            setFullName(profileData.full_name || '');
            setPhone(profileData.phone || '');
            setCity(profileData.city || '');
            setDistrict(profileData.district || '');
            setAvatarUrl(profileData.avatar_url || null);
          }
        } catch (e) {
          console.log('Profil verisi çekilemedi.');
        }

        // 2. Tarla Sayısı
        try {
          const fieldsRes = await fetch(`${API_URL}/fields/${numericUserId}`);
          const fieldsData = await fieldsRes.json();
          if (fieldsRes.ok && Array.isArray(fieldsData)) {
            setTotalFields(fieldsData.length);
          }
        } catch (e) {
          console.log('Tarla verisi çekilemedi.');
        }

        // 3. Araç/Ekipman Sayısı
        try {
          const vehiclesRes = await fetch(`${API_URL}/vehicles/${numericUserId}`);
          const vehiclesData = await vehiclesRes.json();
          if (vehiclesRes.ok && Array.isArray(vehiclesData)) {
            setTotalVehicles(vehiclesData.length);
          }
        } catch (e) {
          console.log('Araç verisi çekilemedi.');
        }

        // 4. Hayvan Varlığı Sayısı
        try {
          const livestockRes = await fetch(`${API_URL}/livestock/${numericUserId}`);
          const livestockData = await livestockRes.json();
          if (livestockRes.ok && Array.isArray(livestockData)) {
            setTotalLivestock(livestockData.length);
          }
        } catch (e) {
          console.log('Hayvan verisi çekilemedi.');
        }

        // 5. Görev İstatistikleri
        try {
          const tasksRes = await fetch(`${API_URL}/tasks/${numericUserId}`);
          const tasksData = await tasksRes.json();
          if (tasksRes.ok && Array.isArray(tasksData)) {
            setTotalTaskCount(tasksData.length);
            const completed = tasksData.filter((t: any) => t.completed).length;
            setCompletedTaskCount(completed);
          }
        } catch (e) {
          console.log('Görev verisi çekilemedi.');
        }

        // 6. Gider İstatistikleri ve Grafik Hesabı
        try {
          const expRes = await fetch(`${API_URL}/expenses/${numericUserId}`);
          const expData = await expRes.json();
          if (expRes.ok && Array.isArray(expData)) {
            let total = 0;
            let mazot = 0;
            let bakim = 0;
            let parca = 0;
            let diger = 0;

            expData.forEach((item: any) => {
              const val = parseFloat(item.amountTL || item.amount_tl || 0);
              total += val;
              if (item.category === 'mazot') mazot += val;
              else if (item.category === 'bakim') bakim += val;
              else if (item.category === 'parca') parca += val;
              else diger += val;
            });

            setTotalExpensesTL(total);

            // Grafik Oranları
            if (total > 0) {
              setBreakdown([
                { category: 'Mazot & Yakıt', amount: mazot, color: '#E53935', percentage: Math.round((mazot / total) * 100) },
                { category: 'Yem & Rasyon', amount: diger, color: '#43A047', percentage: Math.round((diger / total) * 100) },
                { category: 'Bakım & Servis', amount: bakim, color: '#FB8C00', percentage: Math.round((bakim / total) * 100) },
                { category: 'Yedek Parça', amount: parca, color: '#1E88E5', percentage: Math.round((parca / total) * 100) },
              ]);
            } else {
              setBreakdown([
                { category: 'Mazot & Yakıt', amount: 4500, color: '#E53935', percentage: 45 },
                { category: 'Yem & Rasyon', amount: 3000, color: '#43A047', percentage: 30 },
                { category: 'Bakım & Servis', amount: 1500, color: '#FB8C00', percentage: 15 },
                { category: 'Yedek Parça', amount: 1000, color: '#1E88E5', percentage: 10 },
              ]);
            }
          }
        } catch (e) {
          console.log('Gider verisi çekilemedi.');
        }

      } catch (error) {
        console.error('Profil yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
  }, []);

  // Galeri İzni ve Görsel Seçme
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni vermelisiniz.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatarUrl(base64Image);
    }
  };

  // Profil Bilgilerini Kaydet
  const handleSaveProfile = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          fullName,
          phone,
          city,
          district,
          avatarUrl,
        }),
      });

      if (response.ok) {
        Alert.alert('Başarılı', 'Profil bilgileri ve fotoğrafınız güncellendi.');
      } else {
        Alert.alert('Hata', 'Profil güncellenemedi.');
      }
    } catch (error: any) {
      Alert.alert('Hata', 'Sunucuya ulaşılamadı.');
    } finally {
      setSaving(false);
    }
  };

  // Çıkış Yap
  const handleLogout = async () => {
    Alert.alert('Çıkış Yap', 'Oturumunuz kapatılacaktır. Onaylıyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace('/(tabs)' as any);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color="#0F382C" />
      </SafeAreaView>
    );
  }

  const taskSuccessRate = totalTaskCount > 0 
    ? Math.round((completedTaskCount / totalTaskCount) * 100) 
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F382C" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşletme & Çiftçi Yönetimi</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PROFİL BAŞLIK KARTI */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={38} color="#0F382C" />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={12} color="#FFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.profileName}>{fullName || 'Çiftçi Profil'}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <View style={styles.badgeTag}>
            <Ionicons name="leaf" size={12} color="#0F382C" style={{ marginRight: 4 }} />
            <Text style={styles.badgeTagText}>{farmType}</Text>
          </View>
        </View>

        {/* 1. CANLI ÇİFTLİK METRİKLERİ */}
        <Text style={styles.sectionHeaderTitle}>Çiftlik Varlık Özeti</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E2ECE9' }]}>
              <MaterialCommunityIcons name="sprout" size={20} color="#0F382C" />
            </View>
            <Text style={styles.statValue}>{totalFields}</Text>
            <Text style={styles.statLabel}>Kayıtlı Tarla</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: '#F5E6D3' }]}>
              <FontAwesome5 name="cow" size={16} color="#0F382C" />
            </View>
            <Text style={styles.statValue}>{totalLivestock}</Text>
            <Text style={styles.statLabel}>Hayvan Sayısı</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="tractor" size={20} color="#0F382C" />
            </View>
            <Text style={styles.statValue}>{totalVehicles}</Text>
            <Text style={styles.statLabel}>Araç & Ekipman</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="checkbox-outline" size={20} color="#E65100" />
            </View>
            <Text style={styles.statValue}>%{taskSuccessRate}</Text>
            <Text style={styles.statLabel}>İş Başarısı</Text>
          </View>
        </View>

        {/* 2. FİNANSAL ANALİZ VE GİDER GRAFİĞİ */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="chart-pie" size={22} color="#0F382C" />
            <Text style={styles.cardHeaderTitle}>İşletme Gider Dağılımı</Text>
          </View>

          <View style={styles.totalExpenseBanner}>
            <Text style={styles.totalExpenseLabel}>Toplam Takip Edilen Harcama</Text>
            <Text style={styles.totalExpenseValue}>
              ₺{totalExpensesTL > 0 ? totalExpensesTL.toLocaleString('tr-TR') : '10,000.00'}
            </Text>
          </View>

          {/* Dinamik Grafik Bar Alanı */}
          <Text style={styles.chartSubLabel}>Harcama Kalemleri Dağılım Oranı (%)</Text>
          <View style={styles.chartBarContainer}>
            {breakdown.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.chartBarSegment,
                  { backgroundColor: item.color, flex: item.percentage || 1 },
                ]}
              />
            ))}
          </View>

          {/* Grafik Lejant Listesi */}
          <View style={styles.legendContainer}>
            {breakdown.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.category}:</Text>
                <Text style={styles.legendValue}>
                  %{item.percentage} (₺{item.amount.toLocaleString('tr-TR')})
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3. KİŞİSEL BİLGİLER VE KONUM */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="card-outline" size={20} color="#0F382C" />
            <Text style={styles.cardHeaderTitle}>Kişisel & İletişim Bilgileri</Text>
          </View>

          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            placeholder="Ad Soyad Girin"
            placeholderTextColor="#A0AEC0"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Telefon Numarası</Text>
          <TextInput
            style={styles.input}
            placeholder="05XX XXX XX XX"
            placeholderTextColor="#A0AEC0"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>İl</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Çorum"
                placeholderTextColor="#A0AEC0"
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>İlçe</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Alaca / Merkez"
                placeholderTextColor="#A0AEC0"
                value={district}
                onChangeText={setDistrict}
              />
            </View>
          </View>
        </View>

        {/* KAYDET BUTONU */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>PROFİL VE BÜTÇEYİ GÜNCELLE</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5F0' },
  loadingCenter: { justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#0F382C',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  logoutBtn: { padding: 4 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  profileCard: {
    backgroundColor: '#0F382C',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#F5E6D3',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E65100',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F382C',
  },
  profileName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  profileEmail: { color: '#8A9A95', fontSize: 12, marginTop: 2 },
  badgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5E6D3',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
  },
  badgeTagText: { fontSize: 11, fontWeight: 'bold', color: '#0F382C' },

  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F382C',
    marginBottom: 12,
  },

  /* İSTATİSTİK GRID */
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '23.5%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: { fontSize: 15, fontWeight: 'bold', color: '#0F382C' },
  statLabel: { fontSize: 9, color: '#666', fontWeight: 'bold', marginTop: 2, textAlign: 'center' },

  /* KART VE GRAFİK STİLLERİ */
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F5F0',
    paddingBottom: 8,
  },
  cardHeaderTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F382C', marginLeft: 8 },

  totalExpenseBanner: {
    backgroundColor: '#F8F5F0',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2ECE9',
  },
  totalExpenseLabel: { fontSize: 11, color: '#666', fontWeight: 'bold' },
  totalExpenseValue: { fontSize: 22, fontWeight: 'bold', color: '#0F382C', marginTop: 2 },

  chartSubLabel: { fontSize: 11, fontWeight: 'bold', color: '#666', marginBottom: 8 },
  chartBarContainer: {
    height: 16,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E2ECE9',
    marginBottom: 14,
  },
  chartBarSegment: { height: '100%' },

  legendContainer: { marginTop: 4 },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 12, color: '#444', fontWeight: '600' },
  legendValue: { fontSize: 12, fontWeight: 'bold', color: '#0F382C', marginLeft: 'auto' },

  /* FORM STİLLERİ */
  label: { fontSize: 12, fontWeight: 'bold', color: '#0F382C', marginBottom: 4, marginTop: 4 },
  input: {
    backgroundColor: '#F8F5F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2ECE9',
  },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },

  saveBtn: {
    backgroundColor: '#0F382C',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
});