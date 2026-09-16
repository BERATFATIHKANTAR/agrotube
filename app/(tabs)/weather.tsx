import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface HourlyWeather {
  time: string;
  temp: number;
  code: number;
}

interface DailyWeather {
  date: string;
  maxTemp: number;
  minTemp: number;
  code: number;
}

export default function WeatherScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [windSpeed, setWindSpeed] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number>(0);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyWeather[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyWeather[]>([]);

  // Open-Meteo Canlı Hava Durumu API'si (Çorum / Merkez Koordinatları)
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const lat = 40.5506;
        const lon = 34.9556;

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await response.json();

        if (data?.current_weather) {
          setCurrentTemp(Math.round(data.current_weather.temperature));
          setWindSpeed(Math.round(data.current_weather.windspeed));
          setWeatherCode(data.current_weather.weathercode);
        }

        // Saatlik Tahminleri İşle (İlk 12 Saat)
        if (data?.hourly?.time) {
          const currentHour = new Date().getHours();
          const hourly: HourlyWeather[] = [];
          
          if (data.hourly.relativehumidity_2m?.[0]) {
            setHumidity(data.hourly.relativehumidity_2m[currentHour] || 45);
          }

          for (let i = currentHour; i < currentHour + 12; i++) {
            if (data.hourly.time[i]) {
              const timeStr = data.hourly.time[i].split('T')[1]?.substring(0, 5) || `${i}:00`;
              hourly.push({
                time: timeStr,
                temp: Math.round(data.hourly.temperature_2m[i]),
                code: data.hourly.weathercode[i],
              });
            }
          }
          setHourlyForecast(hourly);
        }

        // 7 Günlük Tahminleri İşle
        if (data?.daily?.time) {
          const daily: DailyWeather[] = [];
          for (let i = 0; i < data.daily.time.length; i++) {
            const dateObj = new Date(data.daily.time[i]);
            const dayName = dateObj.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });
            daily.push({
              date: dayName,
              maxTemp: Math.round(data.daily.temperature_2m_max[i]),
              minTemp: Math.round(data.daily.temperature_2m_min[i]),
              code: data.daily.weathercode[i],
            });
          }
          setDailyForecast(daily);
        }
      } catch (error) {
        console.error('Hava durumu çekilirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  // Hava Durumu Koduna Göre Durum Metni ve İkonu
  const getWeatherInfo = (code: number) => {
    if (code >= 51 && code <= 67) {
      return { text: 'Yağmurlu', icon: 'rainy-outline', color: '#64B5F6' };
    }
    if (code >= 1 && code <= 3) {
      return { text: 'Parçalı Bulutlu', icon: 'cloudy-outline', color: '#90A4AE' };
    }
    if (code >= 71) {
      return { text: 'Kar Yağışlı', icon: 'snow-outline', color: '#E0E0E0' };
    }
    return { text: 'Açık / Güneşli', icon: 'sunny-outline', color: '#FFD54F' };
  };

  // İlaçlama Uygunluk Kontrolü (Rüzgar < 15 km/s ve Yağışsızsa Uygundur)
  const isSprayingSuitable = () => {
    if (windSpeed === null) return true;
    return windSpeed < 15 && weatherCode < 51;
  };

  const currentWeather = getWeatherInfo(weatherCode);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B3B2B" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hava Durumu & Tarım Analizi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#2D4A3A" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* CANLI HAVA DURUMU ANA KART */}
            <View style={styles.mainWeatherCard}>
              <Text style={styles.locationText}>📍 Çorum / Merkez</Text>

              <View style={styles.tempRow}>
                <Ionicons name={currentWeather.icon as any} size={64} color="#E8C372" />
                <Text style={styles.tempText}>{currentTemp}°C</Text>
              </View>

              <Text style={styles.weatherStatusText}>{currentWeather.text}</Text>

              {/* METRİKLER (Rüzgar, Nem) */}
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <MaterialCommunityIcons name="weather-windy" size={20} color="#A2B59F" />
                  <Text style={styles.metricValue}>{windSpeed ?? 8} km/s</Text>
                  <Text style={styles.metricLabel}>Rüzgar Hızı</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Ionicons name="water-outline" size={20} color="#A2B59F" />
                  <Text style={styles.metricValue}>%{humidity ?? 45}</Text>
                  <Text style={styles.metricLabel}>Nem Oranı</Text>
                </View>
              </View>
            </View>

            {/* TARIMSAL İLAÇLAMA & GÜBRELEME UYGUNLUK KARTI */}
            <View style={[styles.sprayCard, isSprayingSuitable() ? styles.spraySuccessBg : styles.sprayWarningBg]}>
              <Ionicons
                name={isSprayingSuitable() ? 'checkmark-circle' : 'warning-outline'}
                size={26}
                color={isSprayingSuitable() ? '#2E7D32' : '#C62828'}
              />
              <View style={styles.sprayTextContainer}>
                <Text style={[styles.sprayTitle, { color: isSprayingSuitable() ? '#1B5E20' : '#B71C1C' }]}>
                  {isSprayingSuitable() ? 'İlaçlama İçin Şartlar Uygun' : 'İlaçlama İçin Riskli Hava'}
                </Text>
                <Text style={styles.spraySub}>
                  {isSprayingSuitable()
                    ? 'Rüzgar hızı düşük ve yağış beklenmiyor. Tarlalarınızda ilaçlama yapılabilir.'
                    : 'Rüzgar hızı yüksek veya yağış riski var. İlaçlama yapılması önerilmez.'}
                </Text>
              </View>
            </View>

            {/* SAATLİK HAVA TAHMİNİ (HORIZONTAL SCROLL) */}
            <Text style={styles.sectionTitle}>Saatlik Tahmin</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyRow}>
              {hourlyForecast.map((item, index) => {
                const info = getWeatherInfo(item.code);
                return (
                  <View key={index} style={styles.hourlyCard}>
                    <Text style={styles.hourlyTime}>{item.time}</Text>
                    <Ionicons name={info.icon as any} size={24} color="#2D4A3A" style={{ marginVertical: 6 }} />
                    <Text style={styles.hourlyTemp}>{item.temp}°C</Text>
                  </View>
                );
              })}
            </ScrollView>

            {/* 7 GÜNLÜK DETAYLI TAHMİN */}
            <Text style={styles.sectionTitle}>7 Günlük Tahmin</Text>
            <View style={styles.dailyContainer}>
              {dailyForecast.map((item, index) => {
                const info = getWeatherInfo(item.code);
                return (
                  <View key={index} style={styles.dailyRow}>
                    <Text style={styles.dailyDate}>{item.date}</Text>
                    <View style={styles.dailyStatusGroup}>
                      <Ionicons name={info.icon as any} size={20} color="#2D4A3A" />
                      <Text style={styles.dailyStatusText}>{info.text}</Text>
                    </View>
                    <Text style={styles.dailyTempRange}>
                      {item.maxTemp}° / <Text style={styles.minTempText}>{item.minTemp}°</Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
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
    fontSize: 17,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  mainWeatherCard: {
    backgroundColor: '#1B3B2B',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    color: '#A2B59F',
    fontSize: 13,
    fontWeight: '600',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  tempText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  weatherStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E8C372',
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#A2B59F',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  sprayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  spraySuccessBg: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  sprayWarningBg: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  sprayTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  sprayTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  spraySub: {
    fontSize: 11,
    color: '#444',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B3B2B',
    marginBottom: 12,
  },
  hourlyRow: {
    marginBottom: 20,
  },
  hourlyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  hourlyTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B3B2B',
  },
  dailyContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dailyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2EB',
  },
  dailyDate: {
    width: 90,
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
  },
  dailyStatusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dailyStatusText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  dailyTempRange: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B3B2B',
  },
  minTempText: {
    color: '#888',
    fontWeight: 'normal',
  },
});