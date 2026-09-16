import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

type ExpenseCategory = 'mazot' | 'bakim' | 'parca' | 'diger';

interface Vehicle {
  id: number;
  name: string;
  category: string;
  plate_or_serial?: string;
  working_hours?: number;
}

export default function AddExpenseScreen() {
  const router = useRouter();

  // State'ler
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Form State'leri
  const [category, setCategory] = useState<ExpenseCategory>('mazot');
  const [amountTL, setAmountTL] = useState('');
  const [liter, setLiter] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const [saving, setSaving] = useState(false);
  const API_URL = 'http://10.38.183.165:5001';

  // 1. Veritabanından Kullanıcının Araçlarını Çek
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        const userId = parsed?.id || parsed?.user?.id;

        if (userId) {
          const response = await fetch(`${API_URL}/vehicles/${userId}`);
          const data = await response.json();
          if (response.ok && Array.isArray(data)) {
            setVehicles(data);
            if (data.length > 0) {
              setSelectedVehicle(data[0]); // İlk aracı varsayılan seç
            }
          }
        }
      } catch (error) {
        console.error('Araçlar yüklenirken hata:', error);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  // 2. Gider Kaydetme
  const handleSaveExpense = async () => {
    if (!selectedVehicle) {
      Alert.alert('Eksik Bilgi', 'Lütfen işlem yapılacak aracı seçin.');
      return;
    }

    if (!amountTL.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen harcanan tutarı girin.');
      return;
    }

    setSaving(true);
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const userId = parsed?.id || parsed?.user?.id;

      if (!userId) {
        Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı.');
        return;
      }

      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(userId),
          vehicleId: selectedVehicle.id,
          vehicleName: selectedVehicle.name,
          category,
          amountTL: parseFloat(amountTL),
          liter: category === 'mazot' && liter ? parseFloat(liter) : null,
          description: description.trim(),
          expenseDate,
        }),
      });

      if (response.ok) {
        Alert.alert('Başarılı', `${selectedVehicle.name} için gider kaydedildi.`, [
          { text: 'Tamam', onPress: () => router.back() },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert('Hata', errorData.error || 'Gider kaydedilemedi.');
      }
    } catch (error) {
      console.error('Gider kaydetme hatası:', error);
      Alert.alert('İşlem Başarısız', 'Sunucuya ulaşılamadı.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B3B2B" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Araç İşlemleri & Gider</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 1. ARAÇLARIM SEÇİM LİSTESİ */}
        <Text style={styles.sectionLabel}>Araçlarım (İşlem Yapılacak Aracı Seçin)</Text>

        {loadingVehicles ? (
          <ActivityIndicator size="small" color="#1B3B2B" style={{ marginVertical: 20 }} />
        ) : vehicles.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
            {vehicles.map((v) => {
              const isSelected = selectedVehicle?.id === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleCard, isSelected && styles.selectedVehicleCard]}
                  onPress={() => setSelectedVehicle(v)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="tractor-variant"
                    size={26}
                    color={isSelected ? '#FFF' : '#1B3B2B'}
                  />
                  <Text style={[styles.vehicleName, isSelected && styles.selectedVehicleText]}>
                    {v.name}
                  </Text>
                  <Text style={[styles.vehicleSub, isSelected && styles.selectedVehicleSub]}>
                    {v.category} {v.plate_or_serial ? `• ${v.plate_or_serial}` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.noVehicleBox}>
            <Text style={styles.noVehicleText}>Henüz garajınızda kayıtlı araç bulunmuyor.</Text>
            <TouchableOpacity onPress={() => router.push('/vehicles' as any)}>
              <Text style={styles.addVehicleLink}>Garaja Araç Ekle +</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. SEÇİLİ ARACA ÖZEL MENÜ & FORM */}
        {selectedVehicle && (
          <View style={styles.menuContainer}>
            <View style={styles.selectedHeaderRow}>
              <Ionicons name="checkmark-circle" size={20} color="#2D4A3A" />
              <Text style={styles.selectedTitle}>
                {selectedVehicle.name} İçin İşlem Yapılıyor
              </Text>
            </View>

            {/* İŞLEM MENÜSÜ KATEGORİLERİ */}
            <Text style={styles.inputLabel}>İşlem Türü Seçin</Text>
            <View style={styles.categoryGrid}>
              <TouchableOpacity
                style={[styles.categoryBtn, category === 'mazot' && styles.activeCategoryBtn]}
                onPress={() => setCategory('mazot')}
                activeOpacity={0.85}
              >
                <FontAwesome5 name="gas-pump" size={16} color={category === 'mazot' ? '#FFF' : '#1B3B2B'} />
                <Text style={[styles.categoryBtnText, category === 'mazot' && styles.activeCategoryBtnText]}>
                  Mazot Alımı
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.categoryBtn, category === 'bakim' && styles.activeCategoryBtn]}
                onPress={() => setCategory('bakim')}
                activeOpacity={0.85}
              >
                <Ionicons name="construct" size={16} color={category === 'bakim' ? '#FFF' : '#1B3B2B'} />
                <Text style={[styles.categoryBtnText, category === 'bakim' && styles.activeCategoryBtnText]}>
                  Bakım & Servis
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.categoryBtn, category === 'parca' && styles.activeCategoryBtn]}
                onPress={() => setCategory('parca')}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="cog" size={18} color={category === 'parca' ? '#FFF' : '#1B3B2B'} />
                <Text style={[styles.categoryBtnText, category === 'parca' && styles.activeCategoryBtnText]}>
                  Yedek Parça
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.categoryBtn, category === 'diger' && styles.activeCategoryBtn]}
                onPress={() => setCategory('diger')}
                activeOpacity={0.85}
              >
                <Ionicons name="receipt" size={16} color={category === 'diger' ? '#FFF' : '#1B3B2B'} />
                <Text style={[styles.categoryBtnText, category === 'diger' && styles.activeCategoryBtnText]}>
                  Diğer Masraf
                </Text>
              </TouchableOpacity>
            </View>

            {/* DETAY INPUTLARI */}
            <View style={styles.formFields}>
              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Tutar (TL) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: 1500"
                    keyboardType="numeric"
                    placeholderTextColor="#A0AEC0"
                    value={amountTL}
                    onChangeText={setAmountTL}
                  />
                </View>

                {category === 'mazot' && (
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.inputLabel}>Alınan Litre</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Örn: 40"
                      keyboardType="numeric"
                      placeholderTextColor="#A0AEC0"
                      value={liter}
                      onChangeText={setLiter}
                    />
                  </View>
                )}
              </View>

              <Text style={styles.inputLabel}>Tarih</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-08-12"
                placeholderTextColor="#A0AEC0"
                value={expenseDate}
                onChangeText={setExpenseDate}
              />

              <Text style={styles.inputLabel}>Açıklama / Not</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Örn: Yağ değişimi ve mazot alımı yapıldı."
                placeholderTextColor="#A0AEC0"
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveExpense} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {selectedVehicle.name.toUpperCase()} İÇİN KAYDET
                  </Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2EB' },
  header: {
    backgroundColor: '#1B3B2B',
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },

  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#1B3B2B', marginBottom: 12 },
  vehicleScroll: { marginBottom: 16 },
  vehicleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginRight: 10,
    width: 140,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8E0',
    elevation: 2,
  },
  selectedVehicleCard: {
    backgroundColor: '#1B3B2B',
    borderColor: '#1B3B2B',
  },
  vehicleName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 6,
    textAlign: 'center',
  },
  selectedVehicleText: { color: '#FFF' },
  vehicleSub: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  selectedVehicleSub: { color: '#A2B59F' },

  noVehicleBox: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  noVehicleText: { fontSize: 12, color: '#666' },
  addVehicleLink: { fontSize: 13, fontWeight: 'bold', color: '#1B3B2B', marginTop: 6 },

  /* MENÜ & FORM STİLLERİ */
  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    elevation: 3,
  },
  selectedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2EB',
    paddingBottom: 8,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B3B2B',
    marginLeft: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  categoryBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F2EB',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8E0',
  },
  activeCategoryBtn: {
    backgroundColor: '#1B3B2B',
    borderColor: '#1B3B2B',
  },
  categoryBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1B3B2B',
    marginLeft: 6,
  },
  activeCategoryBtnText: {
    color: '#FFF',
  },

  formFields: { marginTop: 4 },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1B3B2B',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#F5F2EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8E0',
  },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  textArea: { height: 65, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#1B3B2B',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
});