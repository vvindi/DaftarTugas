import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Text, RefreshControl, ScrollView } from 'react-native';
import { Card, Title, Chip, MD2Colors } from 'react-native-paper';

// Komponen ini menerima 'theme' dari App.js sebagai prop
export default function TodoScreen({ theme }) {
  // --- State Management & Data Fetching ---
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodos = useCallback(async () => {
    // Tidak set loading ke true jika hanya refreshing
    if (!refreshing) setLoading(true);
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
  }, [refreshing]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTodos();
  }, [fetchTodos]);

  // --- Styling Dinamis Berdasarkan Tema ---
  const styles = createStyles(theme);

  // --- Tampilan Kondisional (Loading, Error) ---
  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
        />
        <Text style={styles.loadingText}>Mengambil daftar tugas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={styles.centered}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Text style={styles.errorText}>Terjadi Kesalahan: {error}</Text>
        <Text style={styles.errorText}>Tidak dapat memuat data.</Text>
      </ScrollView>
    );
  }

  // --- Render Item untuk FlatList ---
  const renderTodoItem = ({ item: todoList }) => (
    <Card
      style={styles.todoCard}
      elevation={3}
    >
      <Card.Content>
        <Title style={styles.cardTitle}>{todoList.name}</Title>
        {/* Loop melalui items di dalam setiap list */}
        {todoList.items.map((item) => (
          <View
            key={item.id}
            style={styles.itemContainer}
          >
            <Text style={styles.itemText}>{item.title}</Text>
            <Chip
              icon={item.isComplete ? 'check-circle' : 'progress-clock'}
              mode="outlined"
              style={[styles.statusChip, { borderColor: item.isComplete ? MD2Colors.green600 : MD2Colors.orange600 }]}
              textStyle={{ color: item.isComplete ? MD2Colors.green800 : MD2Colors.orange800, fontFamily: 'Roboto-Regular' }}
            >
              {item.isComplete ? 'Selesai' : 'Belum Selesai'}
            </Chip>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  // --- Render Utama Komponen Ini ---
  return (
    <FlatList
      data={todos}
      renderItem={renderTodoItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary, theme.colors.accent]}
          tintColor={theme.colors.primary}
        />
      }
      ListEmptyComponent={() =>
        !loading &&
        !error && (
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>Tidak ada tugas ditemukan.</Text>
          </View>
        )
      }
    />
  );
}

// --- Fungsi untuk Membuat Style ---
const createStyles = (theme) =>
  StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: theme.colors.background },
    loadingText: { marginTop: 10, fontSize: 16, color: theme.colors.text, fontFamily: 'Roboto-Regular' },
    errorText: { color: theme.colors.notification, fontSize: 18, textAlign: 'center', fontFamily: 'Roboto-Regular' },
    listContent: { paddingVertical: 10, paddingHorizontal: 8 },
    todoCard: { marginVertical: 8, marginHorizontal: 8, borderRadius: theme.roundness, backgroundColor: theme.colors.surface },
    cardTitle: { fontSize: 20, marginBottom: 12, color: theme.colors.onSurface, fontFamily: 'Roboto-Bold', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
    itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
    itemText: { fontSize: 16, flex: 1 },
    statusChip: { backgroundColor: theme.colors.surface },
    emptyList: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyListText: { fontSize: 16, color: theme.colors.placeholder, fontFamily: 'Roboto-Regular' },
  });
