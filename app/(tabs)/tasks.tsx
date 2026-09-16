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
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface Task {
  id: number;
  time: string;
  title: string;
  field: string;
  completed: boolean;
  notificationEnabled: boolean;
  task_date?: string;
}

export default function TasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();

  // Takvimden parametre olarak tarih geldiyse onu al, yoksa bugünün tarihini al
  const defaultDateStr = params.date || new Date().toISOString().split('T')[0];

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);

  // Modal State'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newField, setNewField] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(defaultDateStr);

 const API_URL = 'http://10.38.183.165:5001';

  // Takvimden gelen parametre değişirse state'i güncelle
  useEffect(() => {
    if (params.date) {
      setNewTaskDate(params.date);
    }
  }, [params.date]);

  // 1. Veritabanından Kullanıcının Görevlerini Çek
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const userId = parsed?.id || parsed?.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/tasks/${userId}`);
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
        setTasks(data);
      }
    } catch (error) {
      console.error('Görev çekme ağ hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. Görev Tamamlama Durumunu Veritabanında Değiştir
  const toggleTaskCompletion = async (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );

    try {
      await fetch(`${API_URL}/tasks/${taskId}/toggle`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Görev güncelleme hatası:', error);
      fetchTasks();
    }
  };

  // 3. Veritabanına Yeni Görev Kaydet (Tarih Parametreli)
  const handleAddTask = async () => {
    if (!newTitle || !newTime) {
      Alert.alert('Eksik Bilgi', 'Lütfen saat ve görev tanımını doldurun.');
      return;
    }

    setAddingTask(true);
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const userId = parsed?.id || parsed?.user?.id;

      if (!userId) {
        Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı.');
        return;
      }

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(userId),
          time: newTime,
          title: newTitle,
          field: newField.trim() ? newField : 'Genel Tarla',
          taskDate: newTaskDate, // <-- SEÇİLİ TARİH VERİTABANINA GÖNDERİLİYOR
        }),
      });

      const textData = await response.text();
      let data;
      try {
        data = JSON.parse(textData);
      } catch (e) {
        throw new Error('Sunucudan beklenmeyen bir yanıt geldi.');
      }

      if (response.ok) {
        setTasks((prev) => [...prev, data].sort((a, b) => a.time.localeCompare(b.time)));
        setNewTitle('');
        setNewTime('');
        setNewField('');
        setModalVisible(false);
        Alert.alert('Başarılı', `${newTaskDate} tarihine görev başarıyla eklendi.`);
      } else {
        Alert.alert('Hata', data.error || 'Görev eklenemedi.');
      }
    } catch (error: any) {
      console.error('Görev ekleme hatası:', error);
      Alert.alert('İşlem Başarısız', error.message || 'Sunucuya ulaşılamadı.');
    } finally {
      setAddingTask(false);
    }
  };

  const handleNotificationToggle = (task: Task) => {
    Alert.alert(
      'Bildirim Zamanlayıcı',
      `"${task.title}" görevi için saat ${task.time} bildirim sistemi yakında aktif edilecektir.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F382C" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Günün Görevleri</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addHeaderBtn}
        >
          <Ionicons name="add" size={26} color="#0F382C" />
        </TouchableOpacity>
      </View>

      {/* BİLDİRİM BİLGİ BANDI */}
      <View style={styles.infoBanner}>
        <Ionicons name="notifications-outline" size={20} color="#0F382C" />
        <Text style={styles.infoBannerText}>
          Saatlik görev bildirimleri yakında otomatik zamanlama ile aktif olacaktır.
        </Text>
      </View>

      {/* GÖREV LİSTESİ */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          Tüm Planlar ({tasks.filter((t) => t.completed).length}/{tasks.length} Tamamlandı)
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0F382C" style={{ marginTop: 40 }} />
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <View
              key={task.id}
              style={[
                styles.taskCard,
                task.completed && styles.taskCardCompleted,
              ]}
            >
              {/* SAAT DİLİMİ */}
              <View style={styles.timeContainer}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={task.completed ? '#8A9A95' : '#0F382C'}
                />
                <Text
                  style={[
                    styles.timeText,
                    task.completed && styles.timeTextCompleted,
                  ]}
                >
                  {task.time}
                </Text>
              </View>

              {/* GÖREV DETAYI */}
              <TouchableOpacity
                style={styles.taskDetail}
                activeOpacity={0.8}
                onPress={() => toggleTaskCompletion(task.id)}
              >
                <Text
                  style={[
                    styles.taskTitle,
                    task.completed && styles.taskTitleCompleted,
                  ]}
                >
                  {task.title}
                </Text>
                <Text style={styles.taskField}>
                  📍 {task.field} {task.task_date ? `• 🗓️ ${task.task_date}` : ''}
                </Text>
              </TouchableOpacity>

              {/* AKSİYONLAR */}
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  onPress={() => handleNotificationToggle(task)}
                  style={styles.iconBtn}
                >
                  <Ionicons
                    name={
                      task.notificationEnabled
                        ? 'notifications'
                        : 'notifications-off-outline'
                    }
                    size={20}
                    color={task.notificationEnabled ? '#149A9B' : '#A0AEC0'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => toggleTaskCompletion(task.id)}
                  style={styles.iconBtn}
                >
                  <Ionicons
                    name={
                      task.completed ? 'checkmark-circle' : 'ellipse-outline'
                    }
                    size={26}
                    color={task.completed ? '#0F382C' : '#A0AEC0'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={56} color="#8A9A95" />
            <Text style={styles.emptyTitle}>Henüz Görev Eklenmedi</Text>
            <Text style={styles.emptySub}>
              Sağ üstteki "+" butonuna basarak tarlanızda yapacağınız saatlik işleri ekleyebilirsiniz.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* YENİ GÖREV EKLEME MODALI */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Görev Ekle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#8A9A95" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Tarih (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-08-12"
              placeholderTextColor="#A0AEC0"
              value={newTaskDate}
              onChangeText={setNewTaskDate}
            />

            <Text style={styles.label}>Saat (Örn: 08:30)</Text>
            <TextInput
              style={styles.input}
              placeholder="08:30"
              placeholderTextColor="#A0AEC0"
              value={newTime}
              onChangeText={setNewTime}
            />

            <Text style={styles.label}>Görev Tanımı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Gübreleme / İlaçlama Yap"
              placeholderTextColor="#A0AEC0"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.label}>Tarla / Parsel Adı (Opsiyonel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Dere Boyu Tarlası"
              placeholderTextColor="#A0AEC0"
              value={newField}
              onChangeText={setNewField}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddTask} disabled={addingTask}>
              {addingTask ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>VERİTABANINA KAYDET</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5E6D3',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  infoBannerText: {
    color: '#0F382C',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F382C',
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  taskCardCompleted: {
    backgroundColor: '#E2ECE9',
    opacity: 0.75,
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E2ECE9',
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F382C',
    marginTop: 2,
  },
  timeTextCompleted: {
    color: '#8A9A95',
    textDecorationLine: 'line-through',
  },
  taskDetail: {
    flex: 1,
    paddingLeft: 12,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },
  taskTitleCompleted: {
    color: '#8A9A95',
    textDecorationLine: 'line-through',
  },
  taskField: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F382C',
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F382C',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F5F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2ECE9',
  },
  saveBtn: {
    backgroundColor: '#0F382C',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});