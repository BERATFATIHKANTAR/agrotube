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

type AnimalCategory = 'buyukbas' | 'kucukbas' | 'kanatli' | 'at';

interface RationRecipe {
  title: string;
  subTitle: string;
  targetProtein: string;
  targetEnergy: string;
  description: string;
  ingredients: { name: string; amount: string; ratio: string }[];
  tips: string[];
}

// BİLİMSEL NORM LİSTESİ (NRC & INRA Standartları)
const RATION_DATABASE: Record<AnimalCategory, RationRecipe> = {
  buyukbas: {
    title: 'Büyükbaş Rasyon Rehberi',
    subTitle: 'Yoğun Besi Danası & Süt İneği Optimizasyonu',
    targetProtein: '%14 - %16 Ham Protein',
    targetEnergy: '2.6 - 2.8 Mcal/kg KM',
    description: 'Rumen sindirimini maksimuma çıkararak canlı ağırlık artışını ve süt verimini artıran ideal karışım.',
    ingredients: [
      { name: 'Mısır Silajı', amount: '15 - 18 kg', ratio: '%45' },
      { name: 'Yonca Kuru Otu', amount: '3 - 4 kg', ratio: '%15' },
      { name: 'Arpa Kırması / Ezme', amount: '4 - 5 kg', ratio: '%20' },
      { name: 'Ayçiçeği Tohumu Küspesi (%28 HP)', amount: '2 kg', ratio: '%12' },
      { name: 'Buğday Samanı', amount: '1 - 1.5 kg', ratio: '%5' },
      { name: 'Mermer Tozu & Premiks', amount: '150 g', ratio: '%3' },
    ],
    tips: [
      'Asidoz (yem çarpması) riskini önlemek için kaba yem oranı %40 altına düşürülmemelidir.',
      'Su tüketimi serbest olmalı, günde ortalama 60-80 litre temiz su sağlanmalıdır.',
    ],
  },
  kucukbas: {
    title: 'Küçükbaş Rasyon Rehberi',
    subTitle: 'Koyun & Keçi Besi ve Sağım Dengesi',
    targetProtein: '%13 - %15 Ham Protein',
    targetEnergy: '2.4 - 2.6 Mcal/kg KM',
    description: 'Hassas sindirim sistemine uygun, şişme ve idrar taşı riskini minimize eden besleme modeli.',
    ingredients: [
      { name: 'Yonca Kuru Otu / Vejetasyon Otu', amount: '1.2 kg', ratio: '%35' },
      { name: 'Arpa Kırması', amount: '800 g', ratio: '%25' },
      { name: 'Buğday Samanı (İnce Kıyım)', amount: '400 g', ratio: '%15' },
      { name: 'Pamuk Tohumu Küspesi', amount: '300 g', ratio: '%15' },
      { name: 'Yulaf', amount: '200 g', ratio: '%7' },
      { name: 'Tuz & Mermer Tozu', amount: '30 g', ratio: '%3' },
    ],
    tips: [
      'Erkek toklularda idrar yolu taşlarını önlemek için Kalsiyum/Fosfor oranı 2:1 tutulmalıdır.',
      'Ani yem değişikliklerinden kaçınılmalı, geçişler 7-10 güne yayılmalıdır.',
    ],
  },
  kanatli: {
    title: 'Kanatlı Hayvan Rasyon Rehberi',
    subTitle: 'Yumurtacı Tavuk & Etlik Piliç (Broiler) Karışımı',
    targetProtein: '%17 - %19 Ham Protein',
    targetEnergy: '2.900 - 3.100 Kcal/kg',
    description: 'Yumurta kabuk kalitesini ve et tutma kapasitesini zirveye çıkaran kırmasız öğütülmüş rasyon.',
    ingredients: [
      { name: 'Mısır (İnce Öğütülmüş)', amount: '550 g / kg', ratio: '%55' },
      { name: 'Soya Fasulyesi Küspesi (%44 HP)', amount: '260 g / kg', ratio: '%26' },
      { name: 'Buğday', amount: '100 g / kg', ratio: '%10' },
      { name: 'Mermer Tozu / İstiridye Kabuğu', amount: '70 g / kg', ratio: '%7' },
      { name: 'Dicalcium Phosphate (DCP)', amount: '12 g / kg', ratio: '%1.2' },
      { name: 'Vitamin & Mineral Premiks', amount: '8 g / kg', ratio: '%0.8' },
    ],
    tips: [
      'Yumurtacı kanatlılarda kalsiyum ihtiyacı akşam saatlerinde arttığı için istiridye kabuğu öğleden sonra verilmelidir.',
      'Yem tane boyutu çok ince toz olmamalı, granül/kırma form tercih edilmelidir.',
    ],
  },
  at: {
    title: 'At Besleme & Performans Rehberi',
    subTitle: 'Çalışan & Yetişkin At İdeal Enerji Dengesi',
    targetProtein: '%10 - %12 Ham Protein',
    targetEnergy: '2.2 - 2.5 Mcal/kg KM',
    description: 'Kolik (sancı) riskini engelleyen, yüksek kaliteli lif ve dengeli lif altı enerji kaynağı.',
    ingredients: [
      { name: 'Kaliteli Kuru Ot (Çayır / Yonca Karışık)', amount: '7 - 9 kg', ratio: '%60' },
      { name: 'Ezme Yulaf', amount: '2.5 - 3 kg', ratio: '%22' },
      { name: 'Buğday Kepeği (Islatılmış)', amount: '1 kg', ratio: '%10' },
      { name: 'Havuç / Elma Dilimleri', amount: '500 g', ratio: '%5' },
      { name: 'Ayçiçeği Yağı / Keten Tohumu Yağı', amount: '100 ml', ratio: '%2' },
      { name: 'Yalama Taşı & Tuz', amount: 'Serbest', ratio: '%1' },
    ],
    tips: [
      'Atların mide hacmi küçük olduğundan günlük yem miktarı en az 3-4 öğüne bölünmelidir.',
      'Yulaf verilmeden önce kepek ile ıslatılarak verilmesi hazımsızlığı önler.',
    ],
  },
};

export default function OptimalRationScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory>('buyukbas');

  const activeRation = RATION_DATABASE[selectedCategory];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B3B2B" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Altın Rasyon Rehberi</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* BİRLEŞTİRİLMİŞ TEK PARÇA ÜST MENÜ */}
      <View style={styles.segmentedContainer}>
        <View style={styles.segmentedBar}>
          {/* Büyükbaş */}
          <TouchableOpacity
            style={[styles.segmentTab, selectedCategory === 'buyukbas' && styles.activeSegmentTab]}
            onPress={() => setSelectedCategory('buyukbas')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="cow" size={14} color={selectedCategory === 'buyukbas' ? '#1B3B2B' : '#A2B59F'} />
            <Text style={[styles.segmentText, selectedCategory === 'buyukbas' && styles.activeSegmentText]}>
              Büyükbaş
            </Text>
          </TouchableOpacity>

          {/* Küçükbaş */}
          <TouchableOpacity
            style={[styles.segmentTab, selectedCategory === 'kucukbas' && styles.activeSegmentTab]}
            onPress={() => setSelectedCategory('kucukbas')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="bullhorn" size={14} color={selectedCategory === 'kucukbas' ? '#1B3B2B' : '#A2B59F'} />
            <Text style={[styles.segmentText, selectedCategory === 'kucukbas' && styles.activeSegmentText]}>
              Küçükbaş
            </Text>
          </TouchableOpacity>

          {/* Kanatlı */}
          <TouchableOpacity
            style={[styles.segmentTab, selectedCategory === 'kanatli' && styles.activeSegmentTab]}
            onPress={() => setSelectedCategory('kanatli')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="bird" size={16} color={selectedCategory === 'kanatli' ? '#1B3B2B' : '#A2B59F'} />
            <Text style={[styles.segmentText, selectedCategory === 'kanatli' && styles.activeSegmentText]}>
              Kanatlı
            </Text>
          </TouchableOpacity>

          {/* At */}
          <TouchableOpacity
            style={[styles.segmentTab, selectedCategory === 'at' && styles.activeSegmentTab]}
            onPress={() => setSelectedCategory('at')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="horse" size={16} color={selectedCategory === 'at' ? '#1B3B2B' : '#A2B59F'} />
            <Text style={[styles.segmentText, selectedCategory === 'at' && styles.activeSegmentText]}>
              At
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 2. RASYON ÖZET KARTI */}
        <View style={styles.summaryCard}>
          <View style={styles.badgeRow}>
            <View style={styles.goldBadge}>
              <Ionicons name="ribbon" size={14} color="#1B3B2B" />
              <Text style={styles.goldBadgeText}>EN İYİ FORMÜL</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{activeRation.title}</Text>
          <Text style={styles.cardSub}>{activeRation.subTitle}</Text>
          <Text style={styles.cardDesc}>{activeRation.description}</Text>

          {/* Besin Değerleri Şeridi */}
          <View style={styles.targetRow}>
            <View style={styles.targetBox}>
              <Text style={styles.targetLabel}>Ham Protein Hedefi</Text>
              <Text style={styles.targetValue}>{activeRation.targetProtein}</Text>
            </View>
            <View style={styles.targetDivider} />
            <View style={styles.targetBox}>
              <Text style={styles.targetLabel}>Metabolik Enerji</Text>
              <Text style={styles.targetValue}>{activeRation.targetEnergy}</Text>
            </View>
          </View>
        </View>

        {/* 3. İDEAL YEM KARIŞIM LİSTESİ */}
        <View style={styles.sectionHeader}>
          <Ionicons name="list" size={20} color="#1B3B2B" />
          <Text style={styles.sectionTitle}>İdeal Günlük Yem Karışımı</Text>
        </View>

        {activeRation.ingredients.map((item, index) => (
          <View key={index} style={styles.ingredientCard}>
            <View style={styles.ingredientLeft}>
              <View style={styles.bulletCircle}>
                <Text style={styles.bulletText}>{index + 1}</Text>
              </View>
              <Text style={styles.ingredientName}>{item.name}</Text>
            </View>
            
            <View style={styles.ingredientRight}>
              <Text style={styles.ingredientAmount}>{item.amount}</Text>
              <View style={styles.ratioBadge}>
                <Text style={styles.ratioText}>{item.ratio}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* 4. KRİTİK BESLEME İPUÇLARI */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#E8C372" />
            <Text style={styles.tipsTitle}>Uzman Çiftçi & Veteriner Tavsiyesi</Text>
          </View>

          {activeRation.tips.map((tip, idx) => (
            <View key={idx} style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={18} color="#2D4A3A" style={{ marginTop: 2 }} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2EB',
  },
  header: {
    backgroundColor: '#1B3B2B',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  /* BİRLEŞTİRİLMİŞ SEGMENTED ÜST MENÜ */
  segmentedContainer: {
    backgroundColor: '#1B3B2B',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  segmentedBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 4,
    alignItems: 'center',
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  activeSegmentTab: {
    backgroundColor: '#E2D8C3',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#A2B59F',
    marginLeft: 5,
  },
  activeSegmentText: {
    color: '#1B3B2B',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  /* ÖZET KARTI */
  summaryCard: {
    backgroundColor: '#1B3B2B',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    elevation: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2D8C3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goldBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1B3B2B',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cardSub: {
    fontSize: 12,
    color: '#E8C372',
    fontWeight: '600',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: '#A2B59F',
    marginTop: 8,
    lineHeight: 18,
  },
  targetRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    alignItems: 'center',
  },
  targetBox: {
    flex: 1,
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 10,
    color: '#A2B59F',
  },
  targetValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 2,
  },
  targetDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B3B2B',
    marginLeft: 8,
  },

  /* İÇERİK KARTLARI */
  ingredientCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    elevation: 2,
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bulletCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F5F2EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bulletText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D4A3A',
  },
  ingredientName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111',
    flex: 1,
  },
  ingredientRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1B3B2B',
    marginRight: 8,
  },
  ratioBadge: {
    backgroundColor: '#E2E8E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratioText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2D4A3A',
  },

  /* İPUÇLARI */
  tipsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    elevation: 2,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2EB',
    paddingBottom: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B3B2B',
    marginLeft: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#444',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});