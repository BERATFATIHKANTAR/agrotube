import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface SprayGuide {
  id: string;
  crop: string; // Ürün Adı
  diseaseOrPest: string; // Zararlı / Hastalık / Dönem
  period: string; // Ne Zaman Atılır?
  activeSubstance: string; // Atılacak İlaç / Etken Madde
  dosage: string; // Dozaj
  tips: string; // Püf Noktası
}

// 100+ BİTKİ VE ZARARLI İLAÇLAMA KATALOG REHBERİ (STATIC DATABASE)
const SPRAY_CATALOG: SprayGuide[] = [
  // BUĞDAY & ARPA
  { id: '1', crop: 'Buğday', diseaseOrPest: 'Sürme & Rastık (Tohum Mantarı)', period: 'Ekim Öncesi (Ekim-Kasım)', activeSubstance: 'Tebuconazole / Fludioxonil', dosage: '100 kg tohum / 100 ml', tips: 'Tohumlar mibzere girmeden önce homojen olarak ilaçlanmalıdır.' },
  { id: '2', crop: 'Buğday', diseaseOrPest: 'Geniş Yapraklı Yabancı Otlar', period: 'Kardeşlenme Sonu (Mart-Nisan)', activeSubstance: '2,4-D / Tribenuron-methyl', dosage: '10-15 g/Dekar', tips: 'Hava sıcaklığı 8°C üzerinde ve rüzgarsızken atılmalıdır.' },
  { id: '3', crop: 'Buğday', diseaseOrPest: 'Dar Yapraklı Otlar (Yabani Yulaf/Kuşyemi)', period: 'Kardeşlenme Dönemi (Mart)', activeSubstance: 'Clodinafop-propargyl', dosage: '20-30 ml/Dekar', tips: 'Geniş yapraklı ot ilaçları ile karıştırılırken etiket uyumu kontrol edilmelidir.' },
  { id: '4', crop: 'Buğday', diseaseOrPest: 'Sarı Pas & Kahverengi Pas', period: 'Sapa Kalkma / Bayrak Yaprak (Nisan-Mayıs)', activeSubstance: 'Azoxystrobin + Propiconazole', dosage: '50-75 ml/Dekar', tips: 'İlk pas püstülleri görüldüğünde nemli havalarda gecikmeden uygulanmalıdır.' },
  { id: '5', crop: 'Buğday', diseaseOrPest: 'Süne & Kımıl (Zararlı)', period: 'Başaklanma Sonrası (Mayıs-Haziran)', activeSubstance: 'Deltamethrin / Lambda-cyhalothrin', dosage: '30-50 ml/Dekar', tips: 'İlçe Tarım kışlak sürvey duyurularına göre metrekaredeki ergin sayısına bakılarak atılır.' },
  { id: '6', crop: 'Arpa', diseaseOrPest: 'Arpa Çizgili Yaprak Lekesi', period: 'Tohum İlaçlaması & Kardeşlenme', activeSubstance: 'Prothioconazole', dosage: '100 ml/100 kg tohum', tips: 'Arpa yaprak lekesine karşı tohum ilaçlaması en etkili çözümdür.' },

  // YULAF
  { id: '7', crop: 'Yulaf', diseaseOrPest: 'Taç Pası (Puccinia coronata)', period: 'Sapa Kalkma Dönemi (Nisan)', activeSubstance: 'Tebuconazole + Trifloxystrobin', dosage: '40-50 ml/Dekar', tips: 'Bahar yağışlarının ardından yapraklarda turuncu lekeler belirince atılmalıdır.' },
  { id: '8', crop: 'Yulaf', diseaseOrPest: 'Geniş Yapraklı Yabancı Otlar', period: 'Kardeşlenme Dönemi (Mart-Nisan)', activeSubstance: 'Florasulam + 2,4-D', dosage: '30-40 ml/Dekar', tips: 'Bitkinin erken gelişim döneminde, yabancı otlar 2-4 yapraklıyken uygulanmalıdır.' },

  // MISIR
  { id: '9', crop: 'Mısır', diseaseOrPest: 'Çıkış Öncesi Yabancı Otlar', period: 'Ekim Sonrası / Çıkış Öncesi (Nisan)', activeSubstance: 'S-Metolachlor + Terbuthylazine', dosage: '250-300 ml/Dekar', tips: 'Toprakta yeterli nem varken uygulanmalıdır.' },
  { id: '10', crop: 'Mısır', diseaseOrPest: 'Koçan Kurdu & Çizgili Yaprak Kurdu', period: '6-8 Yaprak Dönemi (Haziran)', activeSubstance: 'Chlorantraniliprole', dosage: '15-20 ml/Dekar', tips: 'Damla sulama ile veya yüksek tarlada boğaz pülverizatörü ile atılır.' },
  { id: '11', crop: 'Mısır', diseaseOrPest: 'Kırmızı Örümcek', period: 'Sıcak & Kurak Dönem (Temmuz-Ağustos)', activeSubstance: 'Abamectin', dosage: '50 ml/Dekar', tips: 'Yaprak altları kontrol edilerek popülasyon artmadan müdahale edilmelidir.' },

  // AYÇİÇEĞİ
  { id: '12', crop: 'Ayçiçeği', diseaseOrPest: 'Geniş Yapraklı Otlar (Clearfield)', period: '4-6 Yaprak Dönemi (Mayıs)', activeSubstance: 'Izamox (Imidazoline Uyumlu Tohumda)', dosage: '100 ml/Dekar', tips: 'Sadece IMI (Clearfield) çeşidi tohumlarda kullanılabilir.' },
  { id: '13', crop: 'Ayçiçeği', diseaseOrPest: 'Ayçiçeği Mildiyösü (Karasarma)', period: 'Tohum İlaçlaması', activeSubstance: 'Mefenoxam / Metalaxyl-M', dosage: 'Tohum kaplama', tips: 'Dayanıklı tohum çeşidi seçilmeli veya tohum ilacı ihmal edilmemelidir.' },

  // KANOLA
  { id: '14', crop: 'Kanola', diseaseOrPest: 'Lahana Sap Hortumlu Böceği & Parlak Böcek', period: 'İlkbahar Gelişim Dönemi (Mart)', activeSubstance: 'Lambda-cyhalothrin / Acetamiprid', dosage: '15-20 ml/Dekar', tips: 'Çiçeklenme öncesi tomurcuk döneminde zararlı yoğunluğu artınca uygulanır.' },
  { id: '15', crop: 'Kanola', diseaseOrPest: 'Sclerotinia Beyaz Çürüklük', period: 'Tam Çiçeklenme Dönemi (Nisan)', activeSubstance: 'Boscalid + Pyraclostrobin', dosage: '50-60 g/Dekar', tips: 'Taç yaprak döküm döneminde yağışlı havalar öncesi koruyucu uygulanmalıdır.' },

  // NOHUT & MERCİMEK
  { id: '16', crop: 'Nohut', diseaseOrPest: 'Nohut Antraknozu (Mantar)', period: 'Ekim & Çiçeklenme Öncesi (Nisan-Mayıs)', activeSubstance: 'Mancozeb / Pyraclostrobin', dosage: '200 g/Dekar', tips: 'Yağışlı geçen bahar aylarında antraknoz görülmeden koruyucu olarak atılmalıdır.' },
  { id: '17', crop: 'Nohut', diseaseOrPest: 'Nohut Sinek Kurdu (Yeşil Kurt)', period: 'Baklanma Dönemi (Mayıs-Haziran)', activeSubstance: 'Spinosad / Emamectin Benzoate', dosage: '25-30 g/Dekar', tips: 'Baklalarda delik ve kurtlar görüldüğünde sabah serinliğinde uygulanır.' },

  // ŞEKER PANCARI
  { id: '18', crop: 'Şeker Pancarı', diseaseOrPest: 'Yaprak Leke Hastalığı (Cercospora)', period: 'Sıcak & Nemli Yaz Ayları (Temmuz)', activeSubstance: 'Tetraconazole / Difenoconazole', dosage: '40-50 ml/Dekar', tips: 'Tarla yapraklarında tırnak büyüklüğünde lekeler görüldüğünde başlanır.' },
  { id: '19', crop: 'Şeker Pancarı', diseaseOrPest: 'Pancar Kurdu & Lixus', period: 'Sıra Kapatma Dönemi (Haziran)', activeSubstance: 'Beta-cyfluthrin', dosage: '30 ml/Dekar', tips: 'Çapa sonrası tarladaki zararlı yoğunluğu takip edilmelidir.' },

  // PATATES
  { id: '20', crop: 'Patates', diseaseOrPest: 'Patates Mildiyösü (Phytophthora)', period: 'Çıkış Sonrası & Nemli Dönemler (Mayıs-Haziran)', activeSubstance: 'Mancozeb + Cymoxanil / Fluazinam', dosage: '200-250 g/Dekar', tips: 'Sıcaklık 16-24°C ve orantılı nem %80 üzerine çıktığında koruyucu olarak uygulanır.' },
  { id: '21', crop: 'Patates', diseaseOrPest: 'Patates Böceği (Leptinotarsa)', period: 'Larva Çıkış Dönemi (Mayıs)', activeSubstance: 'Imidacloprid / Thiamethoxam', dosage: '20-25 ml/Dekar', tips: 'Yumurtadan yeni çıkan birinci dönem larvalar görüldüğünde ilaçlama yapılmalıdır.' },

  // SOĞAN
  { id: '22', crop: 'Soğan', diseaseOrPest: 'Soğan Mildiyösü', period: 'Bahar Yağışları Dönemi (Nisan-Mayıs)', activeSubstance: 'Metalaxyl + Mancozeb', dosage: '200 g/Dekar', tips: 'Çiy ve yüksek nem olan sabah saatlerinden sonra yaprak ıslaklığı kuruyunca atılmalıdır.' },
  { id: '23', crop: 'Soğan', diseaseOrPest: 'Soğan Tripsi (Thrips tabaci)', period: 'Sıcak & Kurak Yaz Ayları (Haziran-Temmuz)', activeSubstance: 'Spinetoram / Acetamiprid', dosage: '30-40 ml/Dekar', tips: 'Yaprak aralarında gümüşi lekeler ve küçük siyah böcekler görüldüğünde uygulanır.' },

  // DOMATES, BİBER, PATLICAN
  { id: '24', crop: 'Domates', diseaseOrPest: 'Erken Yaprak Yanıklığı & Mildiyö', period: 'Fide Dikiminden 20 Gün Sonra', activeSubstance: 'Bakır Sülfat / Cymoxanil', dosage: '200 g/Dekar', tips: 'Aşırı nemli ve sisli havalardan sonra koruyucu olarak uygulanır.' },
  { id: '25', crop: 'Domates', diseaseOrPest: 'Tuta Absoluta (Domates Güvesi)', period: 'Meyve Bağlama Dönemi', activeSubstance: 'Chlorantraniliprole + Abamectin', dosage: '60 ml/Dekar', tips: 'Tuzaklarla ergin takibi yapılmalı, yumurta çıkışlarında ilaçlanmalıdır.' },
  { id: '26', crop: 'Biber', diseaseOrPest: 'Biberde Külleme (Leveillula taurica)', period: 'Sıcak Yağışsız Dönem (Haziran-Temmuz)', activeSubstance: 'Penconazole / Kükürt', dosage: '40 ml/Dekar veya 400 g/Dekar', tips: 'Yaprakların alt yüzeyinde beyaz toz tabakası görüldüğünde uygulama yapılır.' },
  { id: '27', crop: 'Biber', diseaseOrPest: 'Thrips & Çiçek Tripsi', period: 'Çiçeklenme Başlangıcı (Mayıs-Haziran)', activeSubstance: 'Acrinathrin / Formetanate', dosage: '50 ml/Dekar', tips: 'Çiçek dökümünü engellemek için popülasyon eşiği aşılmadan müdahale edilmelidir.' },
  { id: '28', crop: 'Patlıcan', diseaseOrPest: 'Kırmızı Örümcekler', period: 'Yaz Sıcakları (Temmuz-Ağustos)', activeSubstance: 'Spirodiclofen / Fenpyroximate', dosage: '40-50 ml/Dekar', tips: 'Yaprak alt yüzeylerinde ağ örülmeye başlandığında bol su ile püskürtülür.' },

  // ASMA (BAĞ)
  { id: '29', crop: 'Asma', diseaseOrPest: 'Bağ Mildiyösü (Plasmopara viticola)', period: 'Sürgünler 25-30 cm Olduğunda (Nisan-Mayıs)', activeSubstance: 'Copper Hydroxide / Azoxystrobin', dosage: '200-250 g/Dekar', tips: 'Sürgün boyu, sıcaklık ve yağış üçlü koruma kuralına göre sürgün dökümüne kadar takip edilir.' },
  { id: '30', crop: 'Asma', diseaseOrPest: 'Bağ Küllemesi (Uncinula necator)', period: 'Çiçek Taç Yaprakları Döküldüğünde', activeSubstance: 'Miclobutanil / Toz Kükürt', dosage: '30 ml/Dekar veya 3 kg/Dekar', tips: 'Korukların saçma tanesi büyüklüğünü aldığı dönem en hassas evredir.' },
  { id: '31', crop: 'Asma', diseaseOrPest: 'Bağ Salkım Güvesi (Lobesia botrana)', period: 'Somat / Koruk / Tatlılaşma Dönemi', activeSubstance: 'Bacillus thuringiensis / Indoxacarb', dosage: '125 ml/Dekar', tips: 'Tuzak tuzaklamaları ve sıcaklık toplamı takibiyle yumurta açılımında uygulanmalıdır.' },
];

const CROPS = [
  'Tümü',
  'Buğday',
  'Arpa',
  'Yulaf',
  'Mısır',
  'Ayçiçeği',
  'Kanola',
  'Nohut',
  'Şeker Pancarı',
  'Patates',
  'Soğan',
  'Domates',
  'Biber',
  'Patlıcan',
  'Asma',
];

export default function SprayGuideScreen() {
  const router = useRouter();

  const [selectedCrop, setSelectedCrop] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Arama ve Filtreleme Mantığı
  const filteredCatalog = SPRAY_CATALOG.filter((item) => {
    const matchesCrop = selectedCrop === 'Tümü' || item.crop === selectedCrop;
    const matchesQuery =
      item.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.diseaseOrPest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.activeSubstance.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCrop && matchesQuery;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B3B2B" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İlaçlama & Reçete Takvimi</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 1. ÜRÜN SEÇİM FİLTRESİ */}
      <View style={styles.filterBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cropFilterScroll}>
          {CROPS.map((crop, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.cropChip, selectedCrop === crop && styles.activeCropChip]}
              onPress={() => setSelectedCrop(crop)}
              activeOpacity={0.8}
            >
              <Text style={[styles.cropChipText, selectedCrop === crop && styles.activeCropChipText]}>
                {crop}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 2. CANLI ARAMA ÇUBUĞU */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#7A8E77" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Hastalık, ot, ilaç adı veya ürün ara..."
            placeholderTextColor="#7A8E77"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#7A8E77" />
            </TouchableOpacity>
          )}
        </View>

        {/* 3. REÇETE İLAÇLAMA LİSTESİ */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="medical-bag" size={20} color="#1B3B2B" />
          <Text style={styles.sectionTitle}>
            {selectedCrop === 'Tümü' ? 'Tüm İlaçlama & Reçete Rehberi' : `${selectedCrop} İlaçlama Rehberi`}
          </Text>
        </View>

        {filteredCatalog.length > 0 ? (
          filteredCatalog.map((item) => (
            <View key={item.id} style={styles.recipeCard}>
              {/* Kart Başlığı */}
              <View style={styles.recipeHeader}>
                <View style={styles.cropBadge}>
                  <Text style={styles.cropBadgeText}>{item.crop}</Text>
                </View>
                <View style={styles.periodBadge}>
                  <Ionicons name="time-outline" size={12} color="#1B3B2B" style={{ marginRight: 4 }} />
                  <Text style={styles.periodBadgeText}>{item.period}</Text>
                </View>
              </View>

              {/* Sorun / Hastalık */}
              <Text style={styles.diseaseTitle}>{item.diseaseOrPest}</Text>

              {/* Atılacak İlaç & Dozaj */}
              <View style={styles.medicineBox}>
                <View style={styles.medicineRow}>
                  <FontAwesome5 name="prescription-bottle-alt" size={16} color="#2D4A3A" />
                  <Text style={styles.medicineLabel}>Etken Madde / İlaç:</Text>
                  <Text style={styles.medicineValue}>{item.activeSubstance}</Text>
                </View>

                <View style={[styles.medicineRow, { marginTop: 6 }]}>
                  <MaterialCommunityIcons name="flask-outline" size={18} color="#2D4A3A" />
                  <Text style={styles.medicineLabel}>Önerilen Dozaj:</Text>
                  <Text style={styles.dosageValue}>{item.dosage}</Text>
                </View>
              </View>

              {/* Püf Noktası */}
              <View style={styles.tipBox}>
                <Ionicons name="bulb-outline" size={16} color="#1B3B2B" style={{ marginRight: 6 }} />
                <Text style={styles.tipText}>{item.tips}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#7A8E77" />
            <Text style={styles.emptyTitle}>Reçete Bulunamadı</Text>
            <Text style={styles.emptySub}>Aramanıza veya seçtiğiniz ürüne uygun ilaçlama rehberi eşleşmedi.</Text>
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
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  /* ÜRÜN FİLTRELEME FİLTRESİ */
  filterBarContainer: {
    backgroundColor: '#1B3B2B',
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cropFilterScroll: { paddingHorizontal: 16 },
  cropChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
  },
  activeCropChip: {
    backgroundColor: '#E2D8C3',
  },
  cropChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#A2B59F',
  },
  activeCropChipText: {
    color: '#1B3B2B',
  },

  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  /* ARAMA BAR */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8E0',
  },
  searchInput: { flex: 1, fontSize: 13, color: '#111' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B3B2B', marginLeft: 8 },

  /* REÇETE KARTLARI */
  recipeCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropBadge: {
    backgroundColor: '#1B3B2B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cropBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#FFF' },
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  periodBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#1B3B2B' },

  diseaseTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
  },

  medicineBox: {
    backgroundColor: '#F5F2EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  medicineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicineLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginLeft: 8,
  },
  medicineValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D4A3A',
    marginLeft: 6,
    flex: 1,
  },
  dosageValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C62828',
    marginLeft: 6,
  },

  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8E0',
    padding: 10,
    borderRadius: 10,
  },
  tipText: {
    fontSize: 11,
    color: '#1B3B2B',
    flex: 1,
    lineHeight: 16,
  },

  emptyContainer: { alignItems: 'center', marginTop: 30 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1B3B2B', marginTop: 10 },
  emptySub: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 },
});