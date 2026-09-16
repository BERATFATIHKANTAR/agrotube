import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function FarmerInfoScreen() {
  const router = useRouter();
  const [city, setCity] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.step}>Adım 1 / 2</Text>
        <Text style={styles.title}>Kişisel Bilgiler</Text>
        <Text style={styles.sub}>Tarlalarınıza özel hava ve toprak verisi sunabilmemiz için bölgeni seç.</Text>

        <Text style={styles.label}>Bulunduğun İl / İlçe</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: Çorum / Merkez"
          value={city}
          onChangeText={setCity}
        />

        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => router.push('/onboarding/add-field')}
        >
          <Text style={styles.btnText}>DEVAM ET (TARLA EKLE)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5F0', padding: 24 },
  content: { flex: 1, justifyContent: 'center' },
  step: { fontSize: 12, fontWeight: 'bold', color: '#8A9A95', textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0F382C', marginBottom: 8 },
  sub: { fontSize: 14, color: '#555', marginBottom: 32 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#0F382C', marginBottom: 8 },
  input: { backgroundColor: '#FFF', height: 50, borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 24 },
  btn: { backgroundColor: '#0F382C', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});