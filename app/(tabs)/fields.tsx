import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Field {
  id: number;
  name: string;
  location: string;
  size: string;
  crop: string;
}

export default function FieldsScreen() {
  const router = useRouter();

  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

 const API_URL = 'http://10.38.183.165:5001';

  // 1. Veritabanından Kullanıcının Tarlalarını Çek
  const fetchFields = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const userId = parsed?.id || parsed?.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/fields/${userId}`);
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
        setFields(data);
        setFilteredFields(data);
      } else {
        console.error('Tarlalar çekilirken hata:', data);
      }
    } catch (error) {
      console.error('Tarla çekme ağ hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // 2. Arama/Filtreleme
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredFields(fields);
      return;
    }
    const filtered = fields.filter(
      (f) =>
        f.name.toLowerCase().includes(text.toLowerCase()) ||
        f.location.toLowerCase().includes(text.toLowerCase()) ||
        f.crop.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFields(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F382C" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tarlalarım</Text>
        <TouchableOpacity
          onPress={() => router.push('/onboarding/add-field' as any)}
          style={styles.addHeaderBtn}
        >
          <Ionicons name="add" size={26} color="#0F382C" />
        </TouchableOpacity>
      </View>

      {/* ARAMA ÇUBUĞU */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#8A9A95" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Tarla adı, konum veya ürün ara..."
          placeholderTextColor="#8A9A95"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color="#8A9A95" />
          </TouchableOpacity>
        )}
      </View>

      {/* TARLA LİSTESİ */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Kayıtlı Araziler ({filteredFields.length})</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0F382C" style={{ marginTop: 40 }} />
        ) : filteredFields.length > 0 ? (
          filteredFields.map((field) => (
            <TouchableOpacity
              key={field.id}
              style={styles.fieldCard}
              activeOpacity={0.85}
              onPress={() =>
                Alert.alert(field.name, `${field.location}\nBüyüklük: ${field.size}\nEkili Ürün: ${field.crop}`)
              }
            >
              <View style={styles.fieldCardHeader}>
                <View style={styles.fieldIconBox}>
                  <MaterialCommunityIcons name="sprout" size={24} color="#0F382C" />
                </View>
                <View style={styles.fieldTitleBox}>
                  <Text style={styles.fieldName}>{field.name}</Text>
                  <Text style={styles.fieldLocation}>📍 {field.location}</Text>
                </View>
                <View style={styles.cropBadge}>
                  <Text style={styles.cropBadgeText}>{field.crop}</Text>
                </View>
              </View>

              <View style={styles.fieldCardFooter}>
                <View style={styles.footerItem}>
                  <Ionicons name="resize-outline" size={16} color="#8A9A95" />
                  <Text style={styles.footerText}>{field.size}</Text>
                </View>
                <TouchableOpacity style={styles.detailBtn}>
                  <Text style={styles.detailBtnText}>İncele</Text>
                  <Ionicons name="chevron-forward" size={16} color="#0F382C" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="sprout-outline" size={60} color="#8A9A95" />
            <Text style={styles.emptyTitle}>Kayıtlı Tarla Bulunamadı</Text>
            <Text style={styles.emptySub}>
              Arazilerinizi ekleyerek sulama, ilaçlama ve gübreleme takiplerini kolayca yapabilirsiniz.
            </Text>
            <TouchableOpacity
              style={styles.addFieldBtn}
              onPress={() => router.push('/onboarding/add-field' as any)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.addFieldBtnText}>YENİ TARLA EKLE</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F0',
  },
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addHeaderBtn: {
    backgroundColor: '#F5E6D3',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2ECE9',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  listHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F382C',
  },
  fieldCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  fieldCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2ECE9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldTitleBox: {
    flex: 1,
  },
  fieldName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
  },
  fieldLocation: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  cropBadge: {
    backgroundColor: '#F5E6D3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cropBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F382C',
  },
  fieldCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8F5F0',
    paddingTop: 10,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F382C',
    marginRight: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F382C',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  addFieldBtn: {
    backgroundColor: '#0F382C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addFieldBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});