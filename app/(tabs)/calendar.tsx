import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface CropGuide {
  id: string;
  cropName: string;
  type: string; // 'Ekim' | 'Dikim' | 'Hasat' | 'İlaçlama'
  depthOrDosage: string;
  tip: string;
  icon: string;
}

// 12 Ayın Ekim, Hasat ve İlaçlama Rehberi Verileri
const MONTHLY_PLANTING_DATA: Record<number, { planting: CropGuide[]; harvest: CropGuide[]; spraying: CropGuide[] }> = {
  0: { // Ocak
    planting: [
      { id: '1', cropName: 'Sera Marulu / Ispanak', type: 'Sera Ekim', depthOrDosage: '1 - 2 cm', tip: 'Soğuklara dayanıklı seralarda çimlenme takibi yapılmalıdır.', icon: 'sprout' },
      { id: '2', cropName: 'Erkenci Bezelye', type: 'Açık Tarla', depthOrDosage: '3 - 5 cm', tip: 'Toprak tavında ise kışlık erkenci bezelye ekimi başlatılabilir.', icon: 'seed' },
    ],
    harvest: [
      { id: '3', cropName: 'Kışlık Pırasa & Lahana', type: 'Hasat', depthOrDosage: 'Açık Söküm', tip: 'Don olaylarından önce pazara sunulacak ürünler toplanır.', icon: 'carrot' },
    ],
    spraying: [
      { id: '4', cropName: 'Meyve Ağaçları (Bordo Bulamacı)', type: 'Kış İlaçlaması', depthOrDosage: '%2 Bakır Sülfat', tip: 'Ağaçlar uykudayken mantari hastalıklara karşı koruma sağlar.', icon: 'spray-can' },
    ],
  },
  1: { // Şubat
    planting: [
      { id: '5', cropName: 'Kışlık Soğan / Sarımsak', type: 'Dikim', depthOrDosage: '3 - 4 cm', tip: 'Kıska (arpacık) dikimi için toprak nemi kontrol edilmelidir.', icon: 'glass-fragile' },
    ],
    harvest: [
      { id: '6', cropName: 'Kışlık Ispanak & Havuç', type: 'Hasat', depthOrDosage: 'Söküm', tip: 'Toprak nemine göre söküm işlemleri tamamlanır.', icon: 'carrot' },
    ],
    spraying: [
      { id: '7', cropName: 'Meyve Ağaçları 2. Kış İlaçlaması', type: 'Kış Bakımı', depthOrDosage: '%1.5 Bordo Bulamacı', tip: 'Gözler kabarmadan hemen önce son uygulama yapılır.', icon: 'spray-can' },
    ],
  },
  2: { // Mart
    planting: [
      { id: '8', cropName: 'Nohut', type: 'Ekim', depthOrDosage: '5 - 8 cm', tip: 'Erkenci nohut ekiminde antraknoz riskine karşı ilaçlı tohum kullanılmalıdır.', icon: 'seed' },
      { id: '9', cropName: 'Yazlık Arpa / Yulaf', type: 'Ekim', depthOrDosage: '4 - 5 cm', tip: 'Kıştan çıkışta geciken alanlar için yazlık buğdaygiller ekilir.', icon: 'barley' },
    ],
    harvest: [],
    spraying: [
      { id: '10', cropName: 'Buğday & Arpa (Üst Gübreleme)', type: 'Üre Gübreleme', depthOrDosage: '10 - 15 kg/Dekar', tip: 'Kardeşlenme döneminde azotlu gübre uygulaması yapılır.', icon: 'shovels' },
    ],
  },
  3: { // Nisan
    planting: [
      { id: '11', cropName: 'Mısır (Danelik / Silajlık)', type: 'Ekim', depthOrDosage: '5 - 6 cm', tip: 'Toprak sıcaklığının 10-12°C üzerine çıkması beklenmelidir.', icon: 'corn' },
      { id: '12', cropName: 'Ayçiçeği', type: 'Ekim', depthOrDosage: '4 - 5 cm', tip: 'Mibzer ayarı ve sıra arası 70 cm mesafeye dikkat edilmelidir.', icon: 'sunflower' },
      { id: '13', cropName: 'Şeker Pancarı', type: 'Ekim', depthOrDosage: '2 - 3 cm', tip: 'Tohum yatağı düzgün ve sıkıştırılmış olmalıdır.', icon: 'sprout' },
    ],
    harvest: [],
    spraying: [
      { id: '14', cropName: 'Buğday (Geniş / Dar Yapraklı Ot)', type: 'Yabancı Ot İlaçlaması', depthOrDosage: 'Sistemik Herbisit', tip: 'Rüzgarsız ve ılık havalarda sap kalkmadan önce uygulanmalıdır.', icon: 'spray-can' },
    ],
  },
  4: { // Mayıs
    planting: [
      { id: '15', cropName: 'Fasulye (Kuru / Taze)', type: 'Ekim', depthOrDosage: '3 - 5 cm', tip: 'Don tehlikesi tamamen geçtikten sonra ekim yapılmalıdır.', icon: 'seed' },
      { id: '16', cropName: 'Domates & Biber & Patlıcan', type: 'Fide Dikimi', depthOrDosage: 'Kök Boğazı', tip: 'Fideler can suyu verilerek akşamüstü dikilmelidir.', icon: 'chili-hot' },
    ],
    harvest: [
      { id: '17', cropName: 'Erkenci Çilek & Kiraz', type: 'Hasat', depthOrDosage: 'Elle Toplama', tip: 'Sabah erken saatlerde zedelenmeden toplanmalıdır.', icon: 'food-apple' },
    ],
    spraying: [
      { id: '18', cropName: 'Meyve Ağaçları (İç Kurt / Pas)', type: 'Fungisit & İnsektisit', depthOrDosage: 'Etiket Dozu', tip: 'Çiçek taç yaprakları döküldükten hemen sonra başlanır.', icon: 'spray-can' },
    ],
  },
  5: { // Haziran
    planting: [
      { id: '19', cropName: '2. Ürün Silajlık Mısır', type: 'Ekim', depthOrDosage: '5 - 6 cm', tip: 'Hububat hasadı sonrası vakit kaybetmeden ekilmelidir.', icon: 'corn' },
    ],
    harvest: [
      { id: '20', cropName: 'Arpa & Buğday', type: 'Biçerdöver Hasadı', depthOrDosage: 'Dane Nem <%14', tip: 'Dane dökümünü önlemek için biçim saati iyi ayarlanmalıdır.', icon: 'tractor-variant' },
      { id: '21', cropName: 'Kiraz & Kayısı', type: 'Meyve Hasadı', depthOrDosage: 'Hasat', tip: 'Kalibreye göre sınıflandırılarak soğuk hava deposuna sevk edilir.', icon: 'food-apple' },
    ],
    spraying: [
      { id: '22', cropName: 'Şeker Pancarı (Çapa & İlaç)', type: 'Yaprak Leke İlaçlaması', depthOrDosage: 'Koruyucu Fungisit', tip: 'Cercospora yaprak lekesine karşı ilk belirtilerde uygulanır.', icon: 'spray-can' },
    ],
  },
  6: { // Temmuz
    planting: [
      { id: '23', cropName: '2. Ürün Soya / Ayçiçeği', type: 'Ekim', depthOrDosage: '4 - 5 cm', tip: 'Anız yakılmadan, doğrudan ekim mibzeri tercih edilmelidir.', icon: 'sunflower' },
    ],
    harvest: [
      { id: '24', cropName: 'Buğday (Geç Bölgeler) & Nohut', type: 'Hasat', depthOrDosage: 'Biçer / Söküm', tip: 'Nohutta baklaların tamamen sararması beklenir.', icon: 'barley' },
      { id: '25', cropName: 'Yazlık Sebzeler (Domates/Biber)', type: 'Kademeli Hasat', depthOrDosage: 'Toplama', tip: 'Haftada 2-3 kez pazar durumuna göre toplanır.', icon: 'chili-hot' },
    ],
    spraying: [
      { id: '26', cropName: 'Mısır (Koçan Kurdu / Kırmızı Örümcek)', type: 'Zararlı İlaçlaması', depthOrDosage: 'Damlama / Tarla Pulverizatörü', tip: 'Yaprak altı kontrollerine göre ilaçlama kararı verilir.', icon: 'spray-can' },
    ],
  },
  7: { // Ağustos
    planting: [
      { id: '27', cropName: 'Kışlık Ispanak & Turp', type: 'Ekim', depthOrDosage: '1 - 2 cm', tip: 'Sonbahar hasadı için nemli toprağa serpme veya sıraya ekilir.', icon: 'sprout' },
      { id: '28', cropName: 'Sonbahar Kanola (Kolza)', type: 'Ekim', depthOrDosage: '1.5 - 2 cm', tip: 'Kışa 6-8 yaprak döneminde girmesi için ekim zamanı kaçırılmamalıdır.', icon: 'seed' },
    ],
    harvest: [
      { id: '29', cropName: 'Ayçiçeği Hasadı', type: 'Biçerdöver', depthOrDosage: 'Tabla Ayarlı', tip: 'Tabla arkası karardığında ve nem %10 altına düştüğünde biçilir.', icon: 'sunflower' },
      { id: '30', cropName: 'Kuru Fasulye Sökümü', type: 'Yolma / Biçim', depthOrDosage: 'Kurutma', tip: 'Yolunan fasulyeler tarlada yığın yapılarak kurumaya bırakılır.', icon: 'seed' },
    ],
    spraying: [
      { id: '31', cropName: 'Sebzelerde Kırmızı Örümcek & Külleme', type: 'Son Bahçe İlaçlaması', depthOrDosage: 'Spesifik Akarisit', tip: 'Son ilaçlama ile hasat arasındaki bekleme süresine uyulmalıdır.', icon: 'spray-can' },
    ],
  },
  8: { // Eylül
    planting: [
      { id: '32', cropName: 'Kışlık Pırasa & Lahana', type: 'Dikim', depthOrDosage: 'Kök Seviyesi', tip: 'Fide dikimi sonrası düzenli sulama yapılmalıdır.', icon: 'flower' },
    ],
    harvest: [
      { id: '33', cropName: 'Silajlık Mısır Biçimi', type: 'Silaj Hasadı', depthOrDosage: '1 - 2 cm Kıyım', tip: 'Mısır koçanındaki danelerin süt çizgisi yaralandığında biçilir.', icon: 'corn' },
      { id: '34', cropName: 'Şeker Pancarı Sökümü', type: 'Pancar Söküm Makinesi', depthOrDosage: 'Baş Kesim', tip: 'Fabrika teslimat kotalarına göre söküm planlanır.', icon: 'sprout' },
    ],
    spraying: [
      { id: '35', cropName: 'Meyve Ağaçları Hasat Sonrası', type: 'Çinko & Bor İlaçlaması', depthOrDosage: 'Yaprak Gübresi', tip: 'Gelecek yılın meyve gözlerini güçlendirmek için uygulanır.', icon: 'spray-can' },
    ],
  },
  9: { // Ekim
    planting: [
      { id: '36', cropName: 'Ekmeklik Buğday', type: 'Ekim', depthOrDosage: '4 - 6 cm', tip: 'Tohum miktarı mibzerle dekara 18-22 kg olarak ayarlanmalıdır.', icon: 'barley' },
      { id: '37', cropName: 'Kışlık Arpa', type: 'Ekim', depthOrDosage: '4 - 5 cm', tip: 'Kardeşlenme kapasitesi yüksek tohumlar tercih edilmelidir.', icon: 'barley' },
    ],
    harvest: [
      { id: '38', cropName: 'Danelik Mısır Hasadı', type: 'Biçerdöver', depthOrDosage: 'Nem <%20', tip: 'Kurutma maliyetini düşürmek için nem oranı takip edilmelidir.', icon: 'corn' },
      { id: '39', cropName: 'Elma & Ceviz Hasadı', type: 'Toplama / Silkeleme', depthOrDosage: 'Tarak / Sallama', tip: 'Ceviz kabuğu çatladığında silkeleme yapılır.', icon: 'food-apple' },
    ],
    spraying: [
      { id: '40', cropName: 'Hububat Ekim Öncesi Tohum İlaçlama', type: 'Tohum İlaçlama', depthOrDosage: 'Koruyucu Mantar İlacı', tip: 'Sürme ve rastık hastalıklarına karşı tohumlar ilaçlanmalıdır.', icon: 'spray-can' },
    ],
  },
  10: { // Kasım
    planting: [
      { id: '41', cropName: 'Geç Kışlık Buğday', type: 'Ekim', depthOrDosage: '5 cm', tip: 'Don öncesi çimlenmeyi sağlamak için derinlik iyi ayarlanmalıdır.', icon: 'barley' },
      { id: '42', cropName: 'Sarımsak (Kışlık)', type: 'Dikim', depthOrDosage: '3 - 5 cm', tip: 'Dişler sivri kısımları yukarı gelecek şekilde dikilmelidir.', icon: 'glass-fragile' },
    ],
    harvest: [
      { id: '43', cropName: 'Zeytin Hasadı', type: 'Taraklı Toplama', depthOrDosage: 'Dip / Sıkım', tip: 'Asit oranını korumak için dip zeytinleri ayrı sıkılmalıdır.', icon: 'food-apple' },
    ],
    spraying: [
      { id: '44', cropName: 'Meyve Ağaçları Yaprak Dökümü', type: '%2 Bordo Bulamacı', depthOrDosage: 'Bakır Sülfat', tip: 'Yaprakların %50\'si döküldüğünde ilk kış bakımı yapılır.', icon: 'spray-can' },
    ],
  },
  11: { // Aralık
    planting: [
      { id: '45', cropName: 'Toprak Dinlendirme & Nöbet', type: 'Sürüm', depthOrDosage: '25 - 30 cm', tip: 'Gelecek sezon için derin kış sürümü yapılmalıdır.', icon: 'tractor' },
    ],
    harvest: [
      { id: '46', cropName: 'Kışlık Narenciye (Portakal/Mandalina)', type: 'Hasat', depthOrDosage: 'Makasla Kesim', tip: 'Meyve sapı sıfır kesilerek kasalanmalıdır.', icon: 'food-apple' },
    ],
    spraying: [
      { id: '47', cropName: 'Meyve Ağaçları (Tam Yaprak Dökümü)', type: '%3 Bordo Bulamacı', depthOrDosage: 'Bakır Sülfat', tip: 'Yapraklar tamamen dökülünce kanser ve mantara karşı atılır.', icon: 'spray-can' },
    ],
  },
};

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

type ActiveTab = 'planting' | 'harvest' | 'spraying';

export default function PlantingCalendarScreen() {
  const router = useRouter();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [activeTab, setActiveTab] = useState<ActiveTab>('planting');

  // Ay Değiştirme
  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    }
    setSelectedDay(1);
  };

  // Takvim Matrisi Hesaplama
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;
  const daysInMonthCount = new Date(currentYear, currentMonth + 1, 0).getDate();

  const currentMonthData = MONTHLY_PLANTING_DATA[currentMonth] || { planting: [], harvest: [], spraying: [] };
  const currentItems = currentMonthData[activeTab] || [];

  const renderCalendarGrid = () => {
    const gridCells = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      gridCells.push(<View key={`empty-${i}`} style={styles.emptyDayCell} />);
    }

    for (let day = 1; day <= daysInMonthCount; day++) {
      const isSelected = day === selectedDay;

      gridCells.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={[styles.dayCell, isSelected && styles.selectedDayCell]}
          onPress={() => setSelectedDay(day)}
          activeOpacity={0.8}
        >
          <Text style={[styles.dayCellText, isSelected && styles.selectedDayCellText]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return gridCells;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B3B2B" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tarımsal İş Takvimi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* AYLIK TAKVİM KARTI */}
        <View style={styles.bigCalendarCard}>
          <View style={styles.monthHeaderRow}>
            <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.monthNavBtn}>
              <Ionicons name="chevron-back" size={22} color="#1B3B2B" />
            </TouchableOpacity>

            <Text style={styles.monthTitleText}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>

            <TouchableOpacity onPress={() => changeMonth('next')} style={styles.monthNavBtn}>
              <Ionicons name="chevron-forward" size={22} color="#1B3B2B" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((wd, index) => (
              <Text key={index} style={styles.weekdayLabelText}>
                {wd}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGridContainer}>{renderCalendarGrid()}</View>
        </View>

        {/* KATEGORİ SEKMELERİ (EKİM / HASAT / İLAÇLAMA) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'planting' && styles.activeTabButton]}
            onPress={() => setActiveTab('planting')}
          >
            <Ionicons name="leaf-outline" size={18} color={activeTab === 'planting' ? '#FFF' : '#2D4A3A'} />
            <Text style={[styles.tabText, activeTab === 'planting' && styles.activeTabText]}>
              Ekim ({currentMonthData.planting.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'harvest' && styles.activeTabButton]}
            onPress={() => setActiveTab('harvest')}
          >
            <MaterialCommunityIcons name="tractor-variant" size={18} color={activeTab === 'harvest' ? '#FFF' : '#2D4A3A'} />
            <Text style={[styles.tabText, activeTab === 'harvest' && styles.activeTabText]}>
              Hasat ({currentMonthData.harvest.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'spraying' && styles.activeTabButton]}
            onPress={() => setActiveTab('spraying')}
          >
            <FontAwesome5 name="spray-can" size={15} color={activeTab === 'spraying' ? '#FFF' : '#2D4A3A'} />
            <Text style={[styles.tabText, activeTab === 'spraying' && styles.activeTabText]}>
              İlaçlama ({currentMonthData.spraying.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* LİSTE BAŞLIĞI */}
        <View style={styles.guideHeaderCard}>
          <Ionicons name="information-circle" size={20} color="#2D4A3A" />
          <Text style={styles.guideHeaderText}>
            {MONTH_NAMES[currentMonth]} - {activeTab === 'planting' ? 'Ekim & Dikim' : activeTab === 'harvest' ? 'Hasat Zamanı' : 'İlaçlama & Bakım'} Rehberi
          </Text>
        </View>

        {/* İÇERİK LİSTESİ */}
        {currentItems.length > 0 ? (
          currentItems.map((crop) => (
            <View key={crop.id} style={styles.cropCard}>
              <View style={styles.cropCardHeader}>
                <View style={styles.cropTitleRow}>
                  <MaterialCommunityIcons name={crop.icon as any} size={24} color="#2D4A3A" />
                  <Text style={styles.cropName}>{crop.cropName}</Text>
                </View>
                <View style={[
                  styles.typeBadge,
                  activeTab === 'harvest' && { backgroundColor: '#FFE0B2' },
                  activeTab === 'spraying' && { backgroundColor: '#E1BEE7' }
                ]}>
                  <Text style={[
                    styles.typeBadgeText,
                    activeTab === 'harvest' && { color: '#E65100' },
                    activeTab === 'spraying' && { color: '#6A1B9A' }
                  ]}>
                    {crop.type}
                  </Text>
                </View>
              </View>

              <View style={styles.cropDetailRow}>
                <Text style={styles.detailLabel}>
                  {activeTab === 'planting' ? 'Derinlik / Aralık:' : activeTab === 'harvest' ? 'Kritik Durum:' : 'Dozaj / İlaç:'}
                </Text>
                <Text style={styles.detailValue}>{crop.depthOrDosage}</Text>
              </View>

              <View style={styles.tipBox}>
                <Ionicons name="bulb-outline" size={16} color="#1B3B2B" style={{ marginRight: 6 }} />
                <Text style={styles.tipText}>{crop.tip}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={48} color="#7A8E77" />
            <Text style={styles.emptyTitle}>Öneri Bulunmuyor</Text>
            <Text style={styles.emptySub}>
              Bu ay için seçtiğiniz kategoride kritik bir tarımsal işlem bulunmamaktadır.
            </Text>
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  /* AYLIK TAKVİM KARTI */
  bigCalendarCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitleText: { fontSize: 18, fontWeight: 'bold', color: '#1B3B2B' },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE1',
    paddingBottom: 8,
    marginBottom: 8,
  },
  weekdayLabelText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7A8E77',
  },
  calendarGridContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  emptyDayCell: { width: '14.28%', height: 40 },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  selectedDayCell: { backgroundColor: '#2D4A3A' },
  dayCellText: { fontSize: 13, fontWeight: '600', color: '#1B3B2B' },
  selectedDayCellText: { color: '#FFF', fontWeight: 'bold' },

  /* KATEGORİ SEKMELERİ */
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E2E8E0',
  },
  activeTabButton: {
    backgroundColor: '#2D4A3A',
    borderColor: '#2D4A3A',
  },
  tabText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2D4A3A',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFF',
  },

  /* REHBER KARTLARI */
  guideHeaderCard: {
    backgroundColor: '#E2E8E0',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideHeaderText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B3B2B',
    marginLeft: 8,
  },
  cropCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cropCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cropTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cropName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
    marginLeft: 10,
    flex: 1,
  },
  typeBadge: {
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  cropDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B3B2B',
    marginLeft: 6,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F2EB',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  tipText: {
    fontSize: 11,
    color: '#444',
    flex: 1,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1B3B2B', marginTop: 10 },
  emptySub: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 },
});