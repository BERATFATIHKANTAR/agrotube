import React, { useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ImageBackground,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BUTTON_WIDTH = SCREEN_WIDTH - 64;
const BUTTON_HEIGHT = 56;
const SWIPE_THUMB_SIZE = 48;
const MAX_SWIPE_DISTANCE = BUTTON_WIDTH - SWIPE_THUMB_SIZE - 8;

interface SplashScreenProps {
  onStartPressed?: () => void;
}

export default function SplashScreen({ onStartPressed }: SplashScreenProps) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx <= MAX_SWIPE_DISTANCE) {
          pan.setValue({ x: gestureState.dx, y: 0 });
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx >= MAX_SWIPE_DISTANCE * 0.7) {
          Animated.timing(pan, {
            toValue: { x: MAX_SWIPE_DISTANCE, y: 0 },
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            // Tetikleme sonrası butonu sıfırla ki geri gelindiğinde açık kalmasın
            pan.setValue({ x: 0, y: 0 });
            if (onStartPressed) {
              onStartPressed();
            }
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            bounciness: 8,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F8F5" />

      <LinearGradient
        colors={["#E8F8F5", "#B2EBF2", "#80CBC4"]}
        style={styles.background}
      >
        <ImageBackground
          source={{
            uri: "https://images.pexels.com/photos/38477548/pexels-photo-38477548/free-photo-of-turk-tarlasinda-bugday-hasadi.jpeg?cs=tinysrgb&dpr=1&w=500",
          }}
          style={styles.backgroundImage}
          imageStyle={{ opacity: 0.22 }}
        >
          <View style={styles.contentContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.leafIconContainer}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={56}
                  color="#33691E"
                  style={styles.leafMain}
                />
                <MaterialCommunityIcons
                  name="leaf"
                  size={38}
                  color="#558B2F"
                  style={styles.leafSecondary}
                />
              </View>
              <Text style={styles.logoText}>agrotube</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.swipeTrack}>
              <Text style={styles.buttonText}>SAĞA KAYDIRIN</Text>

              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.swipeThumb,
                  {
                    transform: [{ translateX: pan.x }],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={24}
                  color="#00796B"
                />
              </Animated.View>
            </View>
          </View>
        </ImageBackground>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  backgroundImage: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  logoContainer: { alignItems: "center", justifyContent: "center" },
  leafIconContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  leafMain: { transform: [{ rotate: "-15deg" }] },
  leafSecondary: {
    transform: [{ rotate: "25deg" }],
    marginLeft: -12,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#1B5E20",
    letterSpacing: -1,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  swipeTrack: {
    width: "100%",
    height: BUTTON_HEIGHT,
    backgroundColor: "#00796B",
    borderRadius: BUTTON_HEIGHT / 2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  swipeThumb: {
    position: "absolute",
    left: 4,
    width: SWIPE_THUMB_SIZE,
    height: SWIPE_THUMB_SIZE,
    borderRadius: SWIPE_THUMB_SIZE / 2,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 1.5,
    paddingLeft: 20,
  },
});
