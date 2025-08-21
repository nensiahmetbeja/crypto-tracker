import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

/** Map short ids (user input) -> CoinGecko ids */
const ID_MAP: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  ada: 'cardano',
  xrp: 'ripple',
  doge: 'dogecoin',
};

type Row = { id: string; priceUsd: number; pct24h: number };

/** Fetch prices for a list of ids using CoinGecko (no API key) */
async function fetchPrices(ids: string[]): Promise<Row[]> {
  if (!ids.length) return [];
  const geckoIds = ids.map(i => ID_MAP[i] ?? i).join(',');
  console.log("geckoIds", ids);
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(
    geckoIds
  )}&price_change_percentage=24h`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.map((c: any) => ({
    id: (c.symbol || c.id).toUpperCase(),
    priceUsd: Number(c.current_price),
    pct24h: Number(c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? 0),
  }));
}

export default function Home() {
  const { colors } = useTheme();
  const [coinIds, setCoinIds] = useState<string[]>(['btc', 'eth', 'sol']);
  const [newId, setNewId] = useState('');

  const q = useQuery({
    queryKey: ['prices', coinIds],
    queryFn: () => fetchPrices(coinIds),
    enabled: coinIds.length > 0,
    refetchInterval: 45_000,   // auto-refresh every 45s
    staleTime: 20_000,
  });

  const addCoin = () => {
    const id = newId.trim().toLowerCase();
    if (!id || coinIds.includes(id)) return;
    setCoinIds(prev => [...prev, id]);
    setNewId('');
    q.refetch();
  };

  const removeCoin = (id: string) => {
    setCoinIds(prev => prev.filter(x => x !== id.toLowerCase()));
    q.refetch();
  };

  const data = useMemo<Row[]>(() => q.data || [], [q.data]);

  const formatUsd = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Crypto Tracker</Text>

      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Add coin id (e.g., btc, eth, sol)"
          placeholderTextColor={colors.border}
          value={newId}
          onChangeText={setNewId}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable onPress={addCoin} style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}>
          <Text style={styles.btnText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={() => q.refetch()} />}
        ListEmptyComponent={<Text style={{ color: colors.text, opacity: 0.6 }}>No coins yet. Add one above.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.id, { color: colors.text }]}>{item.id}</Text>
              <Text style={[styles.price, { color: colors.text }]}>{formatUsd(item.priceUsd)}</Text>
              <Text
                style={[
                  styles.pct,
                  { color: item.pct24h < 0 ? '#b91c1c' : '#047857' },
                ]}
              >
                {item.pct24h.toFixed(2)}%
              </Text>
            </View>
            <Pressable onPress={() => removeCoin(item.id)} style={styles.remove}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      {q.isError && (
        <Text style={{ color: '#b91c1c', marginTop: 8 }}>Failed to load prices. Pull to retry.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, height: 44 },
  btn: { backgroundColor: '#111827', paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  btnPressed: { opacity: 0.85 },
  btnText: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  id: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  price: { fontSize: 16 },
  pct: { fontSize: 14, marginTop: 2 },
  remove: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  removeText: { color: '#374151', fontWeight: '600' },
});
