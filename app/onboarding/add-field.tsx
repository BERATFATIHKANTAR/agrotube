import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Türkiye İl ve İlçe Haritası (81 İl Kapsamlı)
const TURKEY_LOCATION_DATA: { [key: string]: string[] } = {
  Adana: [
    "Seyhan",
    "Yüreğir",
    "Çukurova",
    "Ceyhan",
    "Kozan",
    "İmamoğlu",
    "Karataş",
    "Pozantı",
    "Feke",
    "Karaisalı",
  ],
  Adıyaman: ["Merkez", "Besni", "Gölbaşı", "Kahta", "Gerger", "Samsat", "Tut"],
  Afyonkarahisar: [
    "Merkez",
    "Bolvadin",
    "Dinar",
    "Sandıklı",
    "Şuhut",
    "Emirdağ",
    "Çay",
  ],
  Ağrı: ["Merkez", "Doğubayazıt", "Eleşkirt", "Patnos", "Diyadin", "Tutak"],
  Aksaray: ["Merkez", "Eskil", "Gülağaç", "Güzelyurt", "Ortaköy"],
  Amasya: [
    "Merkez",
    "Merzifon",
    "Suluova",
    "Taşova",
    "Göynücek",
    "Gümüşhacıköy",
  ],
  Ankara: [
    "Çankaya",
    "Keçiören",
    "Yenimahalle",
    "Mamak",
    "Etimesgut",
    "Sincan",
    "Gölbaşı",
    "Polatlı",
    "Çubuk",
    "Haymana",
    "Bala",
    "Beypazarı",
  ],
  Antalya: [
    "Muratpaşa",
    "Kepez",
    "Alanya",
    "Manavgat",
    "Serik",
    "Kumluca",
    "Kaş",
    "Finike",
    "Kemer",
    "Elmalı",
  ],
  Ardahan: ["Merkez", "Göle", "Çıldır", "Posof"],
  Artvin: ["Merkez", "Hopa", "Borçka", "Arhavi", "Şavşat", "Yusufeli"],
  Aydın: [
    "Efeler",
    "Nazilli",
    "Söke",
    "Kuşadası",
    "Didim",
    "Çine",
    "Germencik",
    "İncirliova",
  ],
  Balıkesir: [
    "Altıeylül",
    "Karesi",
    "Bandırma",
    "Edremit",
    "Gönen",
    "Burhaniye",
    "Ayvalık",
    "Susurluk",
    "Bigadiç",
  ],
  Bartın: ["Merkez", "Amasra", "Ulus", "Kurucaşile"],
  Batman: ["Merkez", "Baskil", "Gercüş", "Hasankeyf", "Kozluk", "Sason"],
  Bayburt: ["Merkez", "Aydıntepe", "Demirözü"],
  Bilecik: ["Merkez", "Bozüyük", "Söğüt", "Osmaneli"],
  Bingöl: ["Merkez", "Genç", "Solhan", "Karlıova"],
  Bitlis: ["Merkez", "Tatvan", "Ahlat", "Güroymak", "Adilcevaz"],
  Bolu: ["Merkez", "Gerede", "Mengen", "Göynük", "Mudurnu"],
  Burdur: ["Merkez", "Bucak", "Gölhisar", "Yeşilova"],
  Bursa: [
    "Osmangazi",
    "Yıldırım",
    "Nilüfer",
    "İnegöl",
    "Gemlik",
    "Mustafakemalpaşa",
    "Karacabey",
    "Orhangazi",
    "Mudanya",
  ],
  Çanakkale: ["Merkez", "Biga", "Çan", "Gelibolu", "Yenice", "Ezine"],
  Çankırı: ["Merkez", "Çerkeş", "Ilgaz", "Kurşunlu"],
  Çorum: [
    "Merkez",
    "Alaca",
    "Bayat",
    "Boğazkale",
    "Dodurga",
    "İskilip",
    "Kargı",
    "Laçin",
    "Mecitözü",
    "Oğuzlar",
    "Ortaköy",
    "Osmancık",
    "Sungurlu",
    "Uğurludağ",
  ],
  Denizli: [
    "Pamukkale",
    "Merkezefendi",
    "Çivril",
    "Acıpayam",
    "Tavas",
    "Honaz",
    "Sarayköy",
  ],
  Diyarbakır: [
    "Bağlar",
    "Kayapınar",
    "Yenişehir",
    "Sur",
    "Ergani",
    "Bismil",
    "Silvan",
    "Çermik",
  ],
  Düzce: ["Merkez", "Akçakoca", "Kaynaşlı", "Yığılca"],
  Edirne: ["Merkez", "Keşan", "Uzunköprü", "İpsala", "Havsa"],
  Elazığ: ["Merkez", "Kovancılar", "Karakoçan", "Palu", "Sivrice"],
  Erzincan: ["Merkez", "Tercan", "Üzümlü", "Refahiye"],
  Erzurum: [
    "Yakutiye",
    "Palandöken",
    "Aziziye",
    "Horasan",
    "Oltu",
    "Pasinler",
    "Hınıs",
  ],
  Eskişehir: ["Odunpazarı", "Tepebaşı", "Sivrihisar", "Mahmudiye", "Çifteler"],
  Gaziantep: [
    "Şahinbey",
    "Şehitkamil",
    "Nizip",
    "İslahiye",
    "Nurdağı",
    "Oğuzeli",
  ],
  Giresun: ["Merkez", "Bulancak", "Espiye", "Görele", "Tirebolu"],
  Gümüşhane: ["Merkez", "Kelkit", "Şiran", "Köse"],
  Hakkari: ["Merkez", "Yüksekova", "Şemdinli", "Çukurca"],
  Hatay: [
    "Antakya",
    "İskenderun",
    "Defne",
    "Dörtyol",
    "Kırıkhan",
    "Samandağ",
    "Reyhanlı",
    "Arsuz",
  ],
  Iğdır: ["Merkez", "Tuzluca", "Aralık"],
  Isparta: ["Merkez", "Eğirdir", "Yalvaç", "Şarkikaraağaç"],
  İstanbul: [
    "Kadıköy",
    "Beşiktaş",
    "Üsküdar",
    "Ümraniye",
    "Pendik",
    "Esenyurt",
    "Çatalca",
    "Silivri",
    "Şile",
    "Bakırköy",
    "Fatih",
    "Maltepe",
    "Avcılar",
    "Beylikdüzü",
  ],
  İzmir: [
    "Buca",
    "Karabağlar",
    "Bornova",
    "Karşıyaka",
    "Konak",
    "Ödemiş",
    "Bergama",
    "Tire",
    "Torbalı",
    "Menemen",
    "Urla",
    "Çeşme",
    "Kemalpaşa",
  ],
  Kahramanmaraş: [
    "Onikişubat",
    "Dulkadiroğlu",
    "Elbistan",
    "Afşin",
    "Pazarcık",
    "Göksun",
  ],
  Karabük: ["Merkez", "Safranbolu", "Yenice"],
  Karaman: ["Merkez", "Ermenek", "Kılbasan"],
  Kars: ["Merkez", "Kağızman", "Sarıkamış", "Digor"],
  Kastamonu: ["Merkez", "Tosya", "Taşköprü", "Cide", "İnebolu"],
  Kayseri: [
    "Melikgazi",
    "Kocasinan",
    "Talas",
    "Develi",
    "Yahyalı",
    "Bünyan",
    "Pınarbaşı",
  ],
  Kilis: ["Merkez", "Elbeyli", "Musabeyli"],
  Kırıkkale: ["Merkez", "Yahşihan", "Keskin", "Delice"],
  Kırklareli: ["Merkez", "Lüleburgaz", "Babaeski", "Vize"],
  Kırşehir: ["Merkez", "Kaman", "Mucur"],
  Kocaeli: [
    "İzmit",
    "Gebze",
    "Darıca",
    "Körfez",
    "Gölcük",
    "Kandıra",
    "Kartepe",
  ],
  Konya: [
    "Selçuklu",
    "Karatay",
    "Meram",
    "Ereğli",
    "Akşehir",
    "Beyşehir",
    "Cihanbeyli",
    "Kulu",
    "Çumra",
    "Karapınar",
  ],
  Kütahya: ["Merkez", "Tavşanlı", "Simav", "Gediz"],
  Malatya: ["Battalgazi", "Yeşilyurt", "Doğanşehir", "Darende", "Akçadağ"],
  Manisa: [
    "Yunusemre",
    "Şehzadeler",
    "Akhisar",
    "Turgutlu",
    "Salihli",
    "Soma",
    "Alaşehir",
    "Kula",
    "Demirci",
  ],
  Mardin: ["Artuklu", "Kızıltepe", "Nusaybin", "Midyat", "Derik"],
  Mersin: [
    "Tarsus",
    "Toroslar",
    "Akdeniz",
    "Yenişehir",
    "Erdemli",
    "Silifke",
    "Anamur",
    "Mut",
  ],
  Muğla: [
    "Bodrum",
    "Fethiye",
    "Milas",
    "Menteşe",
    "Marmaris",
    "Seydikemer",
    "Yatağan",
    "Dalaman",
  ],
  Muş: ["Merkez", "Bulanık", "Malazgirt", "Varto"],
  Nevşehir: ["Merkez", "Ürgüp", "Avanos", "Gülşehir", "Derinkuyu"],
  Niğde: ["Merkez", "Bor", "Çiftlik", "Ulukışla"],
  Ordu: ["Altınordu", "Ünye", "Fatsa", "Perşembe", "Kumru"],
  Osmaniye: ["Merkez", "Kadirli", "Düziçi", "Bahçe"],
  Rize: ["Merkez", "Çayeli", "Ardeşen", "Pazar", "Fındıklı"],
  Sakarya: [
    "Adapazarı",
    "Serdivan",
    "Erenler",
    "Akyazı",
    "Hendek",
    "Karasu",
    "Geyve",
  ],
  Samsun: [
    "İlkadım",
    "Atakum",
    "Canik",
    "Bafra",
    "Çarşamba",
    "Vezirköprü",
    "Terme",
    "Havza",
  ],
  Şanlıurfa: [
    "Eyyübiye",
    "Haliliye",
    "Karaköprü",
    "Siverek",
    "Viranşehir",
    "Suruç",
    "Birecik",
    "Akçakale",
    "Harran",
  ],
  Siirt: ["Merkez", "Kurtalan", "Pervari", "Eruh"],
  Sinop: ["Merkez", "Boyabat", "Gerze", "Ayancık"],
  Şırnak: ["Merkez", "Cizre", "Silopi", "İdil"],
  Sivas: ["Merkez", "Şarkışla", "Yıldızeli", "Suşehri", "Zara", "Kangal"],
  Tekirdağ: [
    "Süleymanpaşa",
    "Çorlu",
    "Çerkezköy",
    "Kapaklı",
    "Ergene",
    "Malkara",
    "Hayrabolu",
  ],
  Tokat: ["Merkez", "Erbaa", "Turhal", "Niksar", "Zile"],
  Trabzon: ["Ortahisar", "Akçaabat", "Araklı", "Of", "Yomra", "Vakfıkebir"],
  Tunceli: ["Merkez", "Pertek", "Mazgirt", "Ovacık"],
  Uşak: ["Merkez", "Banaz", "Eşme", "Sivaslı"],
  Van: [
    "İpekyolu",
    "Tuşba",
    "Edremit",
    "Erciş",
    "Özalp",
    "Muradiye",
    "Çaldıran",
  ],
  Yalova: ["Merkez", "Çiftlikköy", "Çınarcık", "Altınova"],
  Yozgat: ["Merkez", "Sorgun", "Yerköy", "Boğazlıyan", "Akdağmadeni"],
  Zonguldak: ["Merkez", "Ereğli", "Çaycuma", "Devrek"],
};

const CITY_LIST = Object.keys(TURKEY_LOCATION_DATA);

export default function AddFieldScreen() {
  const router = useRouter();
  const [name, setName] = useState("");

  // Konum Seçimleri
  const [selectedCity, setSelectedCity] = useState("Çorum");
  const [selectedDistrict, setSelectedDistrict] = useState("Merkez");
  const [village, setVillage] = useState("");

  const [size, setSize] = useState("");
  const [crop, setCrop] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal Durumları
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  const API_URL = 'http://10.38.183.165:5001';

  // İl değişince ilçeyi otomatik sıfırla/güncelle
  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    const districts = TURKEY_LOCATION_DATA[city] || ["Merkez"];
    setSelectedDistrict(districts[0]);
    setCityModalVisible(false);
  };

  const handleAddField = async () => {
    if (!name || !selectedCity || !selectedDistrict || !size || !crop) {
      Alert.alert(
        "Hata",
        "Lütfen tarla adı, il, ilçe, büyüklük ve ekili ürün alanlarını doldurun.",
      );
      return;
    }

    const formattedLocation = village.trim()
      ? `${selectedCity} / ${selectedDistrict} (${village.trim()} Köyü/Mah.)`
      : `${selectedCity} / ${selectedDistrict}`;

    setLoading(true);
    try {
      // 1. Kullanıcı oturum bilgisini oku ve doğrulama yap
      const storedUser =
        (await AsyncStorage.getItem("user")) ||
        (await AsyncStorage.getItem("tempUser"));
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const userId = parsed?.id || parsed?.user?.id;

      if (!userId) {
        Alert.alert(
          "Hata",
          "Kullanıcı oturum kimliği bulunamadı. Lütfen tekrar giriş yapın.",
        );
        setLoading(false);
        return;
      }

      // 2. HTTP İsteği
      const response = await fetch(`${API_URL}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          name,
          location: formattedLocation,
          size,
          crop,
        }),
      });

      // 3. Güvenli Yanıt Parse Etme
      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        console.error("Sunucudan HTML/Hatalı yanıt geldi:", textResponse);
        throw new Error(
          "Sunucu beklenmeyen bir yanıt döndürdü. Backend sunucusunun çalıştığından emin olun.",
        );
      }

      if (response.ok) {
        if (parsed?.user) {
          await AsyncStorage.setItem("user", JSON.stringify(parsed.user));
          await AsyncStorage.removeItem("tempUser");
        }

        Alert.alert("Başarılı", "Tarlanız başarıyla eklendi!", [
          { text: "Tamam", onPress: () => router.replace("/index2" as any) },
        ]);
      } else {
        Alert.alert("Hata", data.error || "Tarla eklenemedi.");
      }
    } catch (error: any) {
      console.error("Tarla ekleme hatası:", error);
      Alert.alert("İşlem Başarısız", error.message || "Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Ionicons name="leaf-outline" size={48} color="#0F382C" />
          <Text style={styles.title}>Tarlanı Ekle</Text>
          <Text style={styles.subtitle}>
            İlaçlama ve gübreleme takibini doğru yapmak için tarla bilgilerini
            girin.
          </Text>
        </View>

        <View style={styles.form}>
          {/* TARLA ADI */}
          <Text style={styles.label}>Tarla Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Dere Boyu Tarlası"
            placeholderTextColor="#A0AEC0"
            value={name}
            onChangeText={setName}
          />

          {/* İL SEÇİMİ */}
          <Text style={styles.label}>İl Seçin</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setCityModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.selectInputText}>{selectedCity}</Text>
            <Ionicons name="chevron-down" size={20} color="#0F382C" />
          </TouchableOpacity>

          {/* İLÇE SEÇİMİ */}
          <Text style={styles.label}>İlçe Seçin</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setDistrictModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.selectInputText}>{selectedDistrict}</Text>
            <Ionicons name="chevron-down" size={20} color="#0F382C" />
          </TouchableOpacity>

          {/* KÖY / MAHALLE MANUEL GİRİŞ */}
          <Text style={styles.label}>
            Köy / Mahalle / Belde Adı (Opsiyonel)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Kınık Köyü, Çayır Mah."
            placeholderTextColor="#A0AEC0"
            value={village}
            onChangeText={setVillage}
          />

          {/* BÜYÜKLÜK */}
          <Text style={styles.label}>Büyüklük (Dönüm / Dekar)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 45 Dönüm"
            placeholderTextColor="#A0AEC0"
            value={size}
            onChangeText={setSize}
          />

          {/* EKİLİ ÜRÜN */}
          <Text style={styles.label}>Ekili Ürün</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Mısır, Buğday, Arpa, Ayçiçeği"
            placeholderTextColor="#A0AEC0"
            value={crop}
            onChangeText={setCrop}
          />

          {/* KAYDET BUTONU */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleAddField}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>TARLAYI KAYDET VE DEVAM ET</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* İL SEÇİM MODALI */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cityModalVisible}
        onRequestClose={() => setCityModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCityModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>İl Seçiniz</Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#8A9A95" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={CITY_LIST}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.districtItem,
                    selectedCity === item && styles.activeDistrictItem,
                  ]}
                  onPress={() => handleSelectCity(item)}
                >
                  <Text
                    style={[
                      styles.districtItemText,
                      selectedCity === item && styles.activeDistrictItemText,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedCity === item && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#0F382C"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* İLÇE SEÇİM MODALI */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={districtModalVisible}
        onRequestClose={() => setDistrictModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDistrictModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCity} İlçeleri</Text>
              <TouchableOpacity onPress={() => setDistrictModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#8A9A95" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={TURKEY_LOCATION_DATA[selectedCity] || ["Merkez"]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.districtItem,
                    selectedDistrict === item && styles.activeDistrictItem,
                  ]}
                  onPress={() => {
                    setSelectedDistrict(item);
                    setDistrictModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.districtItemText,
                      selectedDistrict === item &&
                        styles.activeDistrictItemText,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedDistrict === item && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#0F382C"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F5F0" },
  content: { padding: 24, paddingBottom: 40 },
  header: { alignItems: "center", marginTop: 10, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0F382C", marginTop: 8 },
  subtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 15,
  },
  form: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0F382C",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F8F5F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2ECE9",
  },
  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F5F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2ECE9",
  },
  selectInputText: { fontSize: 14, color: "#111", fontWeight: "500" },
  button: {
    backgroundColor: "#0F382C",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F382C",
  },
  districtItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F8F5F0",
    marginBottom: 8,
  },
  activeDistrictItem: {
    backgroundColor: "#E2ECE9",
    borderWidth: 1,
    borderColor: "#0F382C",
  },
  districtItemText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  activeDistrictItemText: {
    fontWeight: "bold",
    color: "#0F382C",
  },
});
