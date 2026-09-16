import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// 1. m2cgen ile üretilen JS modelini aktarıyoruz
import { score } from '../utils/cropModel';

const CROP_CLASSES: { [key: number]: string } = {
  0: 'Elma',
  1: 'Muz',
  2: 'Siyah Fasulye',
  3: 'Nohut',
  4: 'Hindistan Cevizi',
  5: 'Kahve',
  6: 'Pamuk',
  7: 'Üzüm (Bağ)',
  8: 'Jüt',
  9: 'Kuru Fasulye',
  10: 'Mercimek',
  11: 'Mısır',
  12: 'Mango',
  13: 'Güve Fasulyesi',
  14: 'Maş Fasulyesi',
  15: 'Kavun',
  16: 'Portakal',
  17: 'Papaya',
  18: 'Güvercin Bezelyesi',
  19: 'Nar',
  20: 'Pirinç (Çeltik)',
  21: 'Karpuz',
};

export default function CropRecommendationScreen() {
  const router = useRouter();

  // Model Parametreleri (Metin olarak tutuluyor ki kullanıcı rahatça yazıp silebilsin)
  const [nitrogen, setNitrogen] = useState('90');
  const [phosphorus, setPhosphorus] = useState('40');
  const [potassium, setPotassium] = useState('40');
  const [temperature, setTemperature] = useState('25.0');
  const [humidity, setHumidity] = useState('70.0');
  const [rainfall, setRainfall] = useState('100.0');
  const [ph, setPh] = useState('6.5');

  // Tahmin Sonucu State'i
  const [predictedCrop, setPredictedCrop] = useState<string | null>(null);

  // Yapay Zeka Tahmin Fonksiyonu
  const handleAnalyze = () => {
    Keyboard.dismiss();

    // Boş alan kontrolü
    if (!nitrogen || !phosphorus || !potassium || !temperature || !humidity || !rainfall || !ph) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm toprak ve hava değerlerini doldurun.');
      return;
    }

    try {
      const inputVector = [
        Number(nitrogen.replace(',', '.')),
        Number(phosphorus.replace(',', '.')),
        Number(potassium.replace(',', '.')),
        Number(temperature.replace(',', '.')),
        Number(humidity.replace(',', '.')),
        Number(ph.replace(',', '.')),
        Number(rainfall.replace(',', '.')),
      ];

      const result = score(inputVector);

      if (Array.isArray(result)) {
        let maxIndex = 0;
        let maxProb = result[0];

        for (let i = 1; i < result.length; i++) {
          if (result[i] > maxProb) {
            maxProb = result[i];
            maxIndex = i;
          }
        }

        const cropName = CROP_CLASSES[maxIndex] || `Önerilen Mahsül #${maxIndex}`;
        setPredictedCrop(cropName);
      } else if (typeof result === 'number') {
        const cropName = CROP_CLASSES[result] || `Önerilen Mahsül #${result}`;
        setPredictedCrop(cropName);
      } else {
        setPredictedCrop(String(result));
      }
    } catch (error) {
      console.error('Tahmin hatası:', error);
      Alert.alert('Hata', 'Yapay zeka analizi yapılırken bir sorun oluştu.');
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
        <Text style={styles.headerTitle}>Tarlaya Ne Ekmeliyim?</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Yapay Zeka Mahsül Analizi</Text>
            <Text style={styles.sub}>
              Laboratuvar / toprak tahlili değerlerinizi girerek tarlanız için en verimli mahsülü öğrenin.
            </Text>

            {/* TAHMİN SONUCU KARTI */}
            {predictedCrop && (
              <View style={styles.resultCard}>
                <MaterialCommunityIcons name="sprout" size={36} color="#FFF" />
                <View style={styles.resultTextGroup}>
                  <Text style={styles.resultLabel}>Tarlanız İçin En Uygun Mahsül:</Text>
                  <Text style={styles.resultValue}>{predictedCrop}</Text>
                </View>
              </View>
            )}

            {/* NOT GİRER GİBİ INPUT FORMLARI */}
            <View style={styles.gridContainer}>
              {/* Azot */}
              <View style={styles.inputCard}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Azot (N)</Text>
                  <Text style={styles.cardSub}>Topraktaki azot miktarı (mg/kg)</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={nitrogen}
                  onChangeText={setNitrogen}
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Fosfor */}
              <View style={styles.inputCard}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Fosfor (P)</Text>
                  <Text style={styles.cardSub}>Topraktaki fosfor miktarı (mg/kg)</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={phosphorus}
                  onChangeText={setPhosphorus}
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Potasyum */}
              <View style={styles.inputCard}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Potasyum (K)</Text>
                  <Text style={styles.cardSub}>Topraktaki potasyum miktarı (mg/kg)</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={potassium}
                  onChangeText={setPotassium}
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Sıcaklık */}
              <View style={styles.inputCard}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Sıcaklık (°C)</Text>
                  <Text style={styles.cardSub}>Ortalama ortam sıcaklığı</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  keyboardType="decimal-pad"
                  value={temperature}
                  onChangeText={setTemperature}
                  placeholder="25.0"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Nem */}
              <View style={styles.inputCard}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Nem (%)</Text>
                  <Text style={styles.cardSub}>Ortalama bağıl nem oranı</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  keyboardType="decimal-pad"
                  value={humidity}
                  onChangeText={setHumidity}
                  placeholder="70.0"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Yağış */}
              <View style={styles.inputCard}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Yağış (mm)</Text>
                  <Text style={styles.cardSub}>Ortalama yıllık yağış miktarı</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  keyboardType="decimal-pad"
                  value={rainfall}
                  onChangeText={setRainfall}
                  placeholder="100.0"
                  placeholderTextColor="#999"
                />
              </View>

              {/* pH */}
              <View style={styles.inputCard}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>pH Değeri</Text>
                  <Text style={styles.cardSub}>Toprak asitlik / bazlık derecesi (0-14)</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  keyboardType="decimal-pad"
                  value={ph}
                  onChangeText={setPh}
                  placeholder="6.5"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* ANALİZ ET BUTONU */}
            <TouchableOpacity style={styles.btn} onPress={handleAnalyze} activeOpacity={0.85}>
              <MaterialCommunityIcons name="brain" size={22} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>YAPAY ZEKA İLE ANALİZ ET</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF7F2' },
  header: {
    backgroundColor: '#0F382C',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F382C', marginBottom: 4 },
  sub: { fontSize: 13, color: '#555', marginBottom: 20 },

  resultCard: {
    backgroundColor: '#0F382C',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  resultTextGroup: { marginLeft: 14, flex: 1 },
  resultLabel: { color: '#A2B59F', fontSize: 12, fontWeight: '600' },
  resultValue: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 2 },

  gridContainer: { gap: 12 },
  inputCard: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2F0E6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  cardInfo: { flex: 1, marginRight: 10 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F382C' },
  cardSub: { fontSize: 11, color: '#668075', marginTop: 2 },
  textInput: {
    width: 80,
    height: 44,
    backgroundColor: '#F5F9F6',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2D4A3A',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F382C',
  },

  btn: {
    backgroundColor: '#0F382C',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    elevation: 3,
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
