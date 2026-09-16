import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleVerify = () => {
    // Burada backend/Firebase e-posta kod doğrulaması yapılır
    // Doğrulama başarılı ise Onboarding (Çiftçi Bilgileri) adımına geçilir
    router.replace('/onboarding/farmer-info');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="email-check-outline" size={48} color="#0F382C" />
        </View>
        <Text style={styles.title}>E-Postanı Doğrula</Text>
        <Text style={styles.sub}>
          Mail adresine gelen 6 haneli doğrulama kodunu aşağıya gir.
        </Text>

        <TextInput
          style={styles.codeInput}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity style={styles.btn} onPress={handleVerify}>
          <Text style={styles.btnText}>DOĞRULA VE DEVAM ET</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F382C', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#F8F5F0', borderRadius: 24, padding: 24, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2ECE9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F382C', marginBottom: 8 },
  sub: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 24 },
  codeInput: { backgroundColor: '#FFF', width: '100%', height: 50, borderRadius: 14, textAlign: 'center', fontSize: 22, fontWeight: 'bold', borderWidth: 1, borderColor: '#DDD', marginBottom: 20 },
  btn: { backgroundColor: '#0F382C', width: '100%', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});