import React from 'react';
import { StyleSheet, View, StatusBar, ActivityIndicator } from 'react-native';
import { Appbar, Provider as PaperProvider, DefaultTheme, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import TodoScreen from './components/TodoScreens';

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200EE',
    accent: '#03DAC6',
    background: '#F0F2F5',
    surface: '#FFFFFF',
    text: '#333333',
    onSurface: '#333333',
    placeholder: '#A0A0A0',
    notification: '#E53935',
  },
  roundness: 8,
};

// --- Komponen Utama Aplikasi ---
export default function App() {
  // --- Memuat Font Kustom ---
  const [fontsLoaded] = useFonts({
    'Roboto-Bold': require('./assets/fonts/Roboto-Italic-VariableFont_wdth,wght.ttf'),
    'Roboto-Regular': require('./assets/fonts/Roboto-Italic-VariableFont_wdth,wght.ttf'),
  });

  // --- Tampilan Saat Font Belum Dimuat ---
  if (!fontsLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          size="large"
          color={customTheme.colors.primary}
        />
        <Text>Memuat font...</Text>
      </View>
    );
  }

  // --- Render Utama Aplikasi ---
  return (
    <SafeAreaProvider>
      <PaperProvider theme={customTheme}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={customTheme.colors.primary}
        />
        <Appbar.Header>
          <Appbar.Content
            title="Daftar Tugas Harian"
            titleStyle={styles.appBarTitle}
          />
        </Appbar.Header>
        <View style={styles.container}>
          {/* Render komponen TodoScreen di sini */}
          <TodoScreen theme={customTheme} />
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

// --- Gaya (Styling) untuk App.js ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
});
