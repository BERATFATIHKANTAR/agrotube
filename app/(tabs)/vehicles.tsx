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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface VehicleItem {
  id: number;
  name: string;
  category: 'arac' | 'tarim' | 'hayvancilik';
  brandModel: string;
  plateOrSn: string;
  status: string;
}

export default function VehiclesScreen() {
  const router = useRouter();

  const [items, setItems] = useState<VehicleItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'hepsi' | 'arac' | 'tarim' | 'hayvancilik'>('hepsi');

  // HAZIR API STATE'LERİ
  const [apiBrands, setApiBrands] = useState<string[]>([]);
  const [loadingApi, setLoadingApi] = useState(false);

  // Modal State'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'arac' | 'tarim' | 'hayvancilik'>('arac');
  const [brandModel, setBrandModel] = useState('');
  const [plateOrSn, setPlateOrSn] = useState('');
  const [status, setStatus] = useState('Faal');

 const API_URL = 'http://10.38.183.165:5001';

  // 1. HAZIR DIŞ API'DEN MARKA / MODEL LİSTESİ ÇEK
  const fetchExternalBrands = async () => {
    setLoadingApi(true);
    try {
      // Ücretsiz VPIC Araç API'si
      const response = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json');
      const data = await response.json();

      if (data?.Results && Array.isArray(data.Results)) {
        // Popüler ve Türkiye'de yaygın olan araç/traktör markalarını filtrele/öne çıkar
        const popularList = ['FORD', 'MASSEY FERGUSON', 'NEW HOLLAND', 'FIAT', 'DEUTZ-FAHR', 'JOHN DEERE', 'DACIA', 'CUPRA', 'PEUGEOT', 'CITROEN'];
        
        // API'den gelen 10,000+ markayı süzüp popüler olanları başa alıyoruz
        const fetchedList = data.Results
          .map((item: any) => item.Make_Name)
          .filter((makeName: string) => popularList.includes(makeName.toUpperCase()));

        // Eğer API'den süzülen olursa listele, yoksa popüler listeyi göster
        setApiBrands(fetchedList.length > 0 ? Array.from(new Set(fetchedList)) : popularList);
      }
    } catch (error) {
      console.error('Hazır API çekme hatası:', error);
      // Ağ hatası olursa yedek hazır liste
      setApiBrands(['Ford 3000', 'Ford Doblo', 'Massey Ferguson 240', 'New Holland TT55', 'Fiat 480', 'Dacia Duster', 'Citroën C4 X']);
    } finally {
      setLoadingApi(false);
    }
  };

  // 2. Kendi Veritabanından Kullanıcının Araçlarını Çek
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const userId = parsed?.id || parsed?.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/vehicles/${userId}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setItems(data);
        setFilteredItems(data);
      }
    } catch (error) {
      console.error('Araç çekme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchExternalBrands(); // Sayfa açılınca dış API çağrılır
  }, []);

  // 3. Filtreleme
  useEffect(() => {
    let result = items;

    if (selectedCategory !== 'hepsi') {
      result = result.filter((i) => i.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.brandModel && i.brandModel.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (i.plateOrSn && i.plateOrSn.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredItems(result);
  }, [searchQuery, selectedCategory, items]);

  // 4. Veritabanına Kaydet
  const handleAddVehicle = async () => {
    if (!name.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen ad/tanım girin.');
      return;
    }

    setAdding(true);
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const userId = parsed?.id || parsed?.user?.id;

      if (!userId) {
        Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı.');
        return;
      }

      const response = await fetch(`${API_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(userId),
          name,
          category,
          brandModel: category === 'arac' ? brandModel : '',
          plateOrSn: category === 'arac' ? plateOrSn : '',
          status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setItems((prev) => [data, ...prev]);
        setName('');
        setBrandModel('');
        setPlateOrSn('');
        setModalVisible(false);
      } else {
        Alert.alert('Hata', data.error || 'Ekipman kaydı oluşturulamadı.');
      }
    } catch (error: any) {
      Alert.alert('İşlem Başarısız', 'Sunucuya ulaşılamadı.');
    } finally {
      setAdding(false);
    }
  };

  const vehicleCount = items.filter((i) => i.category === 'arac').length;
  const agriCount = items.filter((i) => i.category === 'tarim').length;
  const livestockCount = items.filter((i) => i.category === 'hayvancilik').length;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'arac': return <MaterialCommunityIcons name="tractor" size={24} color="#0F382C" />;
      case 'tarim': return <MaterialCommunityIcons name="tractor-variant" size={24} color="#0F382C" />;
      case 'hayvancilik': return <FontAwesome5 name="cow" size={20} color="#0F382C" />;
      default: return <MaterialCommunityIcons name="tools" size={24} color="#0F382C" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F382C" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Araç & Ekipman Parkı</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addHeaderBtn}>
          <Ionicons name="add" size={26} color="#0F382C" />
        </TouchableOpacity>
      </View>

      {/* ÖZET */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}><Text style={styles.summaryValue}>{vehicleCount}</Text><Text style={styles.summaryLabel}>Araçlar</Text></View>
        <View style={styles.summaryBox}><Text style={styles.summaryValue}>{agriCount}</Text><Text style={styles.summaryLabel}>Tarım Aletleri</Text></View>
        <View style={styles.summaryBox}><Text style={styles.summaryValue}>{livestockCount}</Text><Text style={styles.summaryLabel}>Hayvancılık Ekipmanı</Text></View>
      </View>

      {/* FİLTRELER */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
        <TouchableOpacity style={[styles.catChip, selectedCategory === 'hepsi' && styles.catChipActive]} onPress={() => setSelectedCategory('hepsi')}><Text style={[styles.catChipText, selectedCategory === 'hepsi' && styles.catChipTextActive]}>Tümü ({items.length})</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.catChip, selectedCategory === 'arac' && styles.catChipActive]} onPress={() => setSelectedCategory('arac')}><Text style={[styles.catChipText, selectedCategory === 'arac' && styles.catChipTextActive]}>Araçlar ({vehicleCount})</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.catChip, selectedCategory === 'tarim' && styles.catChipActive]} onPress={() => setSelectedCategory('tarim')}><Text style={[styles.catChipText, selectedCategory === 'tarim' && styles.catChipTextActive]}>Tarım ({agriCount})</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.catChip, selectedCategory === 'hayvancilik' && styles.catChipActive]} onPress={() => setSelectedCategory('hayvancilik')}><Text style={[styles.catChipText, selectedCategory === 'hayvancilik' && styles.catChipTextActive]}>Hayvancılık ({livestockCount})</Text></TouchableOpacity>
      </ScrollView>

      {/* ARAMA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#8A9A95" style={{ marginRight: 8 }} />
        <TextInput placeholder="Parkında ara..." placeholderTextColor="#8A9A95" style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* LİSTE */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? <ActivityIndicator size="large" color="#0F382C" style={{ marginTop: 20 }} /> : filteredItems.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.iconBox}>{getCategoryIcon(item.category)}</View>
            <View style={styles.infoBox}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              {item.category === 'arac' && (
                <Text style={styles.itemSub}>
                  {item.brandModel} {item.plateOrSn ? `• ${item.plateOrSn}` : ''}
                </Text>
              )}
            </View>
            <View style={[styles.statusBadge, item.status === 'Faal' ? styles.statusFaal : styles.statusBakim]}>
              <Text style={[styles.statusText, item.status === 'Faal' ? styles.statusTextFaal : styles.statusTextBakim]}>
                {item.status}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* DİNAMİK YENİ EKLEME MODALI */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Varlık / Ekipman Ekle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#8A9A95" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Kategori Seçin</Text>
            <View style={styles.catSelectorRow}>
              <TouchableOpacity style={[styles.catSelBtn, category === 'arac' && styles.catSelActive]} onPress={() => setCategory('arac')}>
                <Text style={[styles.catSelText, category === 'arac' && styles.catSelTextActive]}>Araç / Traktör</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.catSelBtn, category === 'tarim' && styles.catSelActive]} onPress={() => setCategory('tarim')}>
                <Text style={[styles.catSelText, category === 'tarim' && styles.catSelTextActive]}>Tarım Aleti</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.catSelBtn, category === 'hayvancilik' && styles.catSelActive]} onPress={() => setCategory('hayvancilik')}>
                <Text style={[styles.catSelText, category === 'hayvancilik' && styles.catSelTextActive]}>Hayvancılık</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>
              {category === 'arac' ? 'Araç / Traktör Adı (Örn: Çiftlik Traktörü)' : 'Alet / Ekipman Adı (Örn: Römork, Yem Karma)'}
            </Text>
            <TextInput style={styles.input} placeholder="Ad girin..." value={name} onChangeText={setName} />

            {/* SADECE ARAÇ SEÇİLDİĞİNDE HAZIR DİŞ API MARKA ÇİPLERİ GÖRÜNÜR */}
            {category === 'arac' && (
              <>
                <Text style={styles.label}>Marka / Model Seçin veya Yazın</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: Ford 3000 / Massey Ferguson 240"
                  value={brandModel}
                  onChangeText={setBrandModel}
                />
                
                {/* Hazır Dış API Çipleri */}
                {loadingApi ? (
                  <ActivityIndicator size="small" color="#0F382C" style={{ marginVertical: 6 }} />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                    {apiBrands.map((brand, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.brandChip}
                        onPress={() => {
                          setBrandModel(brand);
                          if (!name) setName(brand);
                        }}
                      >
                        <Text style={styles.brandChipText}>{brand}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <Text style={styles.label}>Plaka veya Seri No</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: 19 AA 123"
                  value={plateOrSn}
                  onChangeText={setPlateOrSn}
                />
              </>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddVehicle} disabled={adding}>
              {adding ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>VERİTABANINA KAYDET</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5F0' },
  header: { backgroundColor: '#0F382C', paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  addHeaderBtn: { backgroundColor: '#F5E6D3', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 14 },
  summaryBox: { width: '31%', backgroundColor: '#FFF', padding: 12, borderRadius: 14, alignItems: 'center', elevation: 2 },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#0F382C' },
  summaryLabel: { fontSize: 10, color: '#666', fontWeight: '600', marginTop: 2, textAlign: 'center' },
  categoryBar: { paddingHorizontal: 20, marginTop: 14, maxHeight: 38 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#E2ECE9', marginRight: 8 },
  catChipActive: { backgroundColor: '#0F382C' },
  catChipText: { fontSize: 12, fontWeight: '600', color: '#0F382C' },
  catChipTextActive: { color: '#FFF', fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 12, paddingHorizontal: 14, height: 44, borderRadius: 14, borderWidth: 1, borderColor: '#E2ECE9' },
  searchInput: { flex: 1, fontSize: 13, color: '#111' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 2 },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2ECE9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoBox: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  itemSub: { fontSize: 11, color: '#666', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusFaal: { backgroundColor: 'rgba(76, 175, 80, 0.15)' },
  statusBakim: { backgroundColor: 'rgba(255, 152, 0, 0.15)' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  statusTextFaal: { color: '#2E7D32' },
  statusTextBakim: { color: '#E65100' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F382C' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#0F382C', marginBottom: 4, marginTop: 4 },
  input: { backgroundColor: '#F8F5F0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#111', marginBottom: 10, borderWidth: 1, borderColor: '#E2ECE9' },
  catSelectorRow: { flexDirection: 'row', marginBottom: 10 },
  catSelBtn: { flex: 1, paddingVertical: 8, backgroundColor: '#F8F5F0', borderRadius: 10, alignItems: 'center', marginRight: 6, borderWidth: 1, borderColor: '#E2ECE9' },
  catSelActive: { backgroundColor: '#0F382C', borderColor: '#0F382C' },
  catSelText: { fontSize: 11, fontWeight: '600', color: '#666' },
  catSelTextActive: { color: '#FFF', fontWeight: 'bold' },
  brandChip: { backgroundColor: '#E2ECE9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginRight: 6, marginBottom: 6 },
  brandChipText: { fontSize: 11, fontWeight: 'bold', color: '#0F382C' },
  saveBtn: { backgroundColor: '#0F382C', height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
});