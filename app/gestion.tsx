import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../lib/theme';
import { Screen } from '../components/ui';

export default function Gestion() {
  const router = useRouter();
  const items = [
    { t: 'Planning', d: 'Semaine, jour, mois, année — ouvre la fiche client', to: '/planning', i: '🗓️' },
    { t: 'Clients', d: 'Liste des bénéficiaires et nouvelle fiche', to: '/clients', i: '👤' },
    { t: 'Visites perdues', d: 'Annulations, reports, absences : motif, facturée, rattrapée', to: '/perdues', i: '⚠️' },
  ];
  return (
    <Screen title="Gestion" back="/">
      <View style={{ gap: 12 }}>
        {items.map((x) => (
          <Pressable key={x.to} onPress={() => router.push(x.to as any)}
            style={({ pressed }) => ({ backgroundColor: '#fff', borderRadius: 14, padding: 18, flexDirection: 'row', gap: 16, alignItems: 'center', borderWidth: 1, borderColor: C.line, opacity: pressed ? 0.9 : 1 })}>
            <Text style={{ fontSize: 30 }}>{x.i}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.ink }}>{x.t}</Text>
              <Text style={{ color: C.muted }}>{x.d}</Text>
            </View>
            <Text style={{ color: C.muted, fontSize: 22 }}>›</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
