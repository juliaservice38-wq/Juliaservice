import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useLibelle } from '../lib/ref';
import { C } from '../lib/theme';
import { fmtDate, hm } from '../lib/dates';
import { Btn, Card, ErrorBox, Loading, Muted, Pill, Row, Screen, Tabs } from '../components/ui';

export default function Perdues() {
  const router = useRouter();
  const lib = useLibelle();
  const [rows, setRows] = useState<any[]>([]);
  const [filtre, setFiltre] = useState('toutes');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const charger = useCallback(() => {
    supabase.from('v_visites_perdues').select('*').order('date_visite', { ascending: false }).limit(300).then(({ data, error }) => {
      if (error) setErr(error.message);
      setRows(data ?? []); setLoading(false);
    });
  }, []);
  useEffect(charger, [charger]);

  const f = rows.filter((r) => filtre === 'toutes' ? true : filtre === 'rattraper' ? !r.rattrapee : filtre === 'nonfact' ? !r.facturee : r.facturee);
  const bascule = async (r: any, champ: 'rattrapee' | 'facturee') => {
    const { error } = await supabase.from('visites').update({ [champ]: !r[champ] }).eq('id', r.id);
    if (error) setErr(error.message); else charger();
  };

  return (
    <Screen title="Visites perdues" back="/gestion">
      <Tabs value={filtre} onChange={setFiltre} tabs={[
        { value: 'toutes', label: `Toutes (${rows.length})` }, { value: 'rattraper', label: 'À rattraper' },
        { value: 'nonfact', label: 'Non facturées' }, { value: 'fact', label: 'Facturées' }]} />
      <ErrorBox msg={err} />
      {loading ? <Loading /> : f.length === 0 ? <Muted>Aucune visite perdue dans cette liste.</Muted> : f.map((r) => (
        <Card key={r.id}>
          <Pressable onPress={() => router.push({ pathname: '/client/[id]', params: { id: r.client_id, visite: r.id } } as any)}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700', color: C.ink }}>{r.prenom ?? ''} {r.nom}{r.ville ? ` — ${r.ville}` : ''}</Text>
              <Pill label={lib('statut_visite', r.statut)} tone="bad" />
            </Row>
            <Muted>{fmtDate(r.date_visite)} · {hm(r.heure_debut)}–{hm(r.heure_fin)}</Muted>
            <Muted>Motif : {r.motif_perte ? lib('motif_perte', r.motif_perte) : 'non renseigné'}</Muted>
          </Pressable>
          <View style={{ height: 8 }} />
          <Row>
            <Btn small kind={r.facturee ? 'primary' : 'ghost'} label={r.facturee ? 'Facturée ✓' : 'Non facturée'} onPress={() => bascule(r, 'facturee')} />
            <Btn small kind={r.rattrapee ? 'primary' : 'ghost'} label={r.rattrapee ? 'Rattrapée ✓' : 'À rattraper'} onPress={() => bascule(r, 'rattrapee')} />
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
