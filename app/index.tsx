import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { C } from '../lib/theme';
import { Btn, Screen } from '../components/ui';

function Tile({ titre, sous, icone, couleur, to }: { titre: string; sous: string; icone: string; couleur: string; to: string }) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(to as any)}
      style={({ pressed }) => ({ flex: 1, minWidth: 260, backgroundColor: couleur, borderRadius: 18, padding: 26, minHeight: 190, justifyContent: 'space-between', opacity: pressed ? 0.9 : 1 })}>
      <Text style={{ fontSize: 44 }}>{icone}</Text>
      <View>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>{titre}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>{sous}</Text>
      </View>
    </Pressable>
  );
}

export default function Accueil() {
  return (
    <Screen title="Julia service" back={false} right={<Btn kind="ghost" small label="Quitter" onPress={() => supabase.auth.signOut()} />}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
        <Tile titre="Gestion" sous="Planning, clients, visites perdues" icone="🗓️" couleur={C.primary} to="/gestion" />
        <Tile titre="Trésorerie" sous="Factures, paiements, dépenses, chiffre d'affaires" icone="💶" couleur={C.accent} to="/tresorerie" />
      </View>
    </Screen>
  );
}
