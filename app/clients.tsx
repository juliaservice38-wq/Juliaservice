import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { C } from '../lib/theme';
import { Btn, Card, ErrorBox, Field, Loading, Muted, Pill, Screen } from '../components/ui';

export default function Clients() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('clients').select('id,nom,prenom,ville,telephone,actif').order('nom').then(({ data, error }) => {
      if (error) setErr(error.message);
      setRows(data ?? []); setLoading(false);
    });
  }, []);

  const f = rows.filter((c) => `${c.nom} ${c.prenom ?? ''} ${c.ville ?? ''}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Screen title="Clients" back="/gestion" right={<Btn small kind="accent" label="+ Client" onPress={() => router.push('/client/nouveau' as any)} />}>
      <Field label="Rechercher" value={q} onChange={setQ} placeholder="Nom, prénom, ville…" />
      <ErrorBox msg={err} />
      {loading ? <Loading /> : f.length === 0 ? <Muted>Aucun client. Créez la première fiche avec « + Client ».</Muted> : f.map((c) => (
        <Pressable key={c.id} onPress={() => router.push({ pathname: '/client/[id]', params: { id: c.id } } as any)}>
          <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontWeight: '700', color: C.ink, fontSize: 16 }}>{c.prenom} {c.nom}</Text>
              <Muted>{[c.ville, c.telephone].filter(Boolean).join(' · ')}</Muted>
            </View>
            {!c.actif && <Pill label="Inactif" />}
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}
