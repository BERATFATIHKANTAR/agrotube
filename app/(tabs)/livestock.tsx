import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface LivestockItem {
  id: number;
  tagNumber: string;
  category: 'büyükbaş' | 'küçükbaş';
  breed: string;
  gender: string;
  ageMonths: number;
  healthStatus: string;
}

export default function LivestockScreen() {
  const router = useRouter();

  const [animals, setAnimals] = useState<LivestockItem[]>([]);
  const [filteredAnimals, setFilteredFields] = useState<LivestockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingAnimal, setAddingAnimal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [tagNumber, setTagNumber] = useState('');
  const [category, setCategory] = useState<'büyükbaş' | 'küçükbaş'>('büyükbaş');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Dişi');
  const [ageMonths, setAgeMonths] = useState('12');

  const API_URL = 'http://10.38.183.165:5001';
  // 1. Veritabanından Hayvanları Çek
  const fetchLivestock = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const userId = parsed?.id || parsed?.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/livestock/${userId}`);
      const textData = await response.text();

      let data;
      try {
        data = JSON.parse(textData);
      } catch (e) {
        console.error('Sunucudan JSON dışı yanıt geldi:', textData);
        setLoading(false);
        return;
      }

      if (response.ok && Array.isArray(data)) {
        setAnimals(data);
        setFilteredFields(data);
      }
    } catch (error) {
      console.error('Hayvan varlığı çekme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivestock();
  }, []);

  // 2. Küpe Numarasına / Cinsine Göre Arama
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredFields(animals);
      return;
    }
    const filtered = animals.filter(
      (a) =>
        a.tagNumber.toLowerCase().includes(text.toLowerCase()) ||
        a.breed.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFields(filtered);
  };

  // 3. Veritabanına Yeni Hayvan Kaydet
  const handleAddAnimal = async () => {
    if (!tagNumber || !breed) {
      Alert.alert('Eksik Bilgi', 'Lütfen küpe numarası ve ırk/cins bilgisini girin.');
      return;
    }

    setAddingAnimal(true);
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const userId = parsed?.id || parsed?.user?.id;

      if (!userId) {
        Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı.');
        return;
      }

      const response = await fetch(`${API_URL}/livestock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(userId),
          tagNumber,
          category,
          breed,
          gender,
          ageMonths: Number(ageMonths) || 12,
        }),
      });

      const textData = await response.text();
      let data;
      try {
        data = JSON.parse(textData);
      } catch (e) {
        throw new Error('Sunucudan geçersiz yanıt geldi.');
      }

      if (response.ok) {
        setAnimals((prev) => [data, ...prev]);
        setFilteredFields((prev) => [data, ...prev]);
        setTagNumber('');
        setBreed('');
        setModalVisible(false);
      } else {
        Alert.alert('Hata', data.error || 'Hayvan kaydı oluşturulamadı.');
      }
    } catch (error: any) {
      Alert.alert('İşlem Başarısız', error.message || 'Sunucuya ulaşılamadı.');
    } finally {
      setAddingAnimal(false);
    }
  };

  // Sayısal İstatistikler
  const cattleCount = animals.filter((a) => a.category === 'büyükbaş').length;
  const sheepCount = animals.filter((a) => a.category === 'küçükbaş').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F382C" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sürü & Hayvan Takibi</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addHeaderBtn}
        >
          <Ionicons name="add" size={26} color="#0F382C" />
        </TouchableOpacity>
      </View>

      {/* SÜRÜ ÖZETİ KARTI */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <FontAwesome5 name="cow" size={22} color="#0F382C" />
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryCount}>{cattleCount}</Text>
            <Text style={styles.summaryLabel}>Büyükbaş</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <FontAwesome5 name="sheep" size={20} color="#0F382C" />
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryCount}>{sheepCount}</Text>
            <Text style={styles.summaryLabel}>Küçükbaş</Text>
          </View>
        </View>
      </View>

      {/* ARAMA ÇUBUĞU */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#8A9A95" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Küpe No (TR19...) veya ırk ara..."
          placeholderTextColor="#8A9A95"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* HAYVAN LİSTESİ */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Sürüdeki Hayvanlar ({filteredAnimals.length})</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0F382C" style={{ marginTop: 40 }} />
        ) : filteredAnimals.length > 0 ? (
          filteredAnimals.map((item) => (
            <View key={item.id} style={styles.animalCard}>
              <View style={styles.animalIconBox}>
                <FontAwesome5
                  name={item.category === 'büyükbaş' ? 'cow' : 'sheep'}
                  size={22}
                  color="#0F382C"
                />
              </View>

              <View style={styles.animalInfo}>
                <Text style={styles.tagNumber}>🏷️ {item.tagNumber}</Text>
                <Text style={styles.breedText}>
                  {item.breed} • {item.gender} • {item.ageMonths} Aylık
                </Text>
              </View>

              <View style={styles.healthBadge}>
                <Text style={styles.healthBadgeText}>{item.healthStatus}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="horse-head" size={56} color="#8A9A95" />
            <Text style={styles.emptyTitle}>Sürüde Kayıtlı Hayvan Yok</Text>
            <Text style={styles.emptySub}>
              Büyükbaş ve küçükbaş hayvanlarınızı küpe numaralarıyla kaydedip aşı ve yem takiplerini yapabilirsiniz.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* YENİ HAYVAN EKLEME MODALI */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sürüye Hayvan Ekle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#8A9A95" />
              </TouchableOpacity>
            </View>

            {/* Tür Seçimi */}
            <Text style={styles.label}>Kategori</Text>
            <View style={styles.categoryToggleRow}>
              <TouchableOpacity
                style={[
                  styles.categoryToggleBtn,
                  category === 'büyükbaş' && styles.categoryToggleActive,
                ]}
                onPress={() => setCategory('büyükbaş')}
              >
                <Text style={[styles.toggleText, category === 'büyükbaş' && styles.toggleTextActive]}>
                  Büyükbaş
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryToggleBtn,
                  category === 'küçükbaş' && styles.categoryToggleActive,
                ]}
                onPress={() => setCategory('küçükbaş')}
              >
                <Text style={[styles.toggleText, category === 'küçükbaş' && styles.toggleTextActive]}>
                  Küçükbaş
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Küpe Numarası</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: TR19 00482"
              placeholderTextColor="#A0AEC0"
              value={tagNumber}
              onChangeText={setTagNumber}
            />

            <Text style={styles.label}>Irk / Cins</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Simental, Holstein, Akkaraman"
              placeholderTextColor="#A0AEC0"
              value={breed}
              onChangeText={setBreed}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Cinsiyet</Text>
                <TextInput
                  style={styles.input}
                  value={gender}
                  onChangeText={setGender}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Yaş (Ay)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={ageMonths}
                  onChangeText={setAgeMonths}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddAnimal} disabled={addingAnimal}>
              {addingAnimal ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>HAYVANI KAYDET</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5F0' },
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
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  addHeaderBtn: {
    backgroundColor: '#F5E6D3',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  summaryTextContainer: { marginLeft: 12 },
  summaryCount: { fontSize: 18, fontWeight: 'bold', color: '#0F382C' },
  summaryLabel: { fontSize: 11, color: '#666', fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2ECE9',
  },
  searchInput: { flex: 1, fontSize: 13, color: '#111' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F382C', marginBottom: 12 },
  animalCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  animalIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E2ECE9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  animalInfo: { flex: 1 },
  tagNumber: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  breedText: { fontSize: 11, color: '#666', marginTop: 2 },
  healthBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  healthBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#2E7D32' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F382C', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 6, lineHeight: 18 },

  /* MODAL STİLLERİ */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F382C' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#0F382C', marginBottom: 4 },
  input: {
    backgroundColor: '#F8F5F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2ECE9',
  },
  categoryToggleRow: { flexDirection: 'row', marginBottom: 12 },
  categoryToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F8F5F0',
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2ECE9',
  },
  categoryToggleActive: { backgroundColor: '#0F382C', borderColor: '#0F382C' },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#666' },
  toggleTextActive: { color: '#FFF', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#0F382C', height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});