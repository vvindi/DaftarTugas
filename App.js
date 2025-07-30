import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, StatusBar, RefreshControl, ScrollView } from 'react-native';
import {
  Appbar,
  Text,
  Provider as PaperProvider,
  DefaultTheme,
  Card,
  Title,
  Chip,
  MD2Colors
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

// --- 1. Definisi Tema Kustom ---
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
  // --- 2. State Management ---
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // --- 3. Memuat Font Kustom ---
  // Path font sekarang langsung relatif dari App.js ke assets/fonts
  const [fontsLoaded] = useFonts({
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
  });

  // --- 4. Fungsi untuk Mengambil Data dari API ---
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://c65296c08e81.ngrok-free.app/api/lists');

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError(err.message);
      console.error('Gagal mengambil data tugas:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // --- 5. Effect Hook untuk Memanggil API Saat Komponen Dimuat ---
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // --- 6. Handler untuk Pull-to-Refresh ---
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTodos();
  }, [fetchTodos]);

  // --- 7. Tampilan Saat Font Belum Dimuat ---
  if (!fontsLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={customTheme.colors.primary} />
        <Text>Memuat font...</Text>
      </View>
    );
  }

  // --- 8. Tampilan Saat Loading Data (Initial Load) ---
  if (loading && !refreshing) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={customTheme}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={customTheme.colors.primary} />
            <Text style={styles.loadingText}>Mengambil daftar tugas...</Text>
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  // --- 9. Tampilan Saat Terjadi Error ---
  if (error) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={customTheme}>
          <Appbar.Header>
            <Appbar.Content title="Daftar Tugas" />
          </Appbar.Header>
          <ScrollView
            contentContainerStyle={styles.centered}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[customTheme.colors.primary]} />
            }
          >
            <Text style={styles.errorText}>Terjadi Kesalahan: {error}</Text>
            <Text style={styles.errorText}>Tidak dapat memuat data. Silakan coba lagi nanti.</Text>
          </ScrollView>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  // --- 10. Komponen untuk Setiap Item Todo di Daftar ---
  const renderTodoItem = ({ item }) => (
    <Card style={styles.todoCard} elevation={3}>
      <Card.Content>
        <Title style={styles.cardTitle}>{item.title}</Title>
        <View style={styles.chipContainer}>
          <Chip
            icon={item.completed ? "check-circle" : "progress-clock"}
            mode="outlined"
            style={[
              styles.statusChip,
              { borderColor: item.completed ? MD2Colors.green600 : MD2Colors.orange600 }
            ]}
            textStyle={{
              color: item.completed ? MD2Colors.green800 : MD2Colors.orange800,
              fontFamily: 'Roboto-Regular'
            }}
          >
            {item.completed ? 'Selesai' : 'Belum Selesai'}
          </Chip>
          <Chip
            icon="account"
            mode="flat"
            style={styles.userIdChip}
            textStyle={{ fontFamily: 'Roboto-Regular' }}
          >
            User ID: {item.userId}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  // --- 11. Render Utama Aplikasi ---
  return (
    <SafeAreaProvider>
      <PaperProvider theme={customTheme}>
        <Appbar.Header>
          <Appbar.Content title="Daftar Tugas Harian" titleStyle={styles.appBarTitle} />
        </Appbar.Header>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={customTheme.colors.primary} />
          <FlatList
            data={todos}
            renderItem={renderTodoItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[customTheme.colors.primary, customTheme.colors.accent]}
                tintColor={customTheme.colors.primary}
              />
            }
            ListEmptyComponent={() => (
              !loading && !error && (
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListText}>Tidak ada tugas ditemukan.</Text>
                </View>
              )
            )}
            ListFooterComponent={() => (
              loading && refreshing && (
                <ActivityIndicator size="small" color={customTheme.colors.primary} style={{ marginVertical: 10 }} />
              )
            )}
          />
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

// --- 12. Gaya (Styling) Aplikasi ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: customTheme.colors.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: customTheme.colors.text,
    fontFamily: 'Roboto-Regular',
  },
  errorText: {
    color: customTheme.colors.notification,
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
    fontFamily: 'Roboto-Regular',
  },
  appBarTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  todoCard: {
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: customTheme.roundness,
    backgroundColor: customTheme.colors.surface,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: customTheme.colors.onSurface,
    fontFamily: 'Roboto-Bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  statusChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: customTheme.colors.surface,
  },
  userIdChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: MD2Colors.blueGrey100,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 16,
    color: customTheme.colors.placeholder,
    fontFamily: 'Roboto-Regular',
  },
});