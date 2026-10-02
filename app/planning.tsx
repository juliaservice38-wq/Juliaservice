import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { C } from '../lib/theme';
import { addDays, addMonths, fmtJour, hm, iso, JOURS, MOIS, parse, startOfWeek } from '../lib/dates';
import { Btn, ErrorBox, Loading, Screen, Tabs } from '../components/ui';

type Visite = {
  id: string; client_id: string; date_visite: string; heure_debut: string; heure_fin: string; statut: string;
  clients: { nom: string; prenom: string | null; ville: string | null } | null;
};
type Vue = 'semaine' | 'jour' | 'mois' | 'annee';

const perdu = (s: string) => ['annulee', 'reportee', 'absence_beneficiaire', 'absence_intervenant'].includes(s);

function Chip({ v, onPress }: { v: Visite; onPress: () => void }) {
  const bg = perdu(v.statut) ? C.dangerSoft : v.statut === 'realisee' ? C.okSoft : C.primarySoft;
  const fg = perdu(v.statut) ? C.danger : v.statut === 'realisee' ? C.ok : C.primaryDark;
  const nom = v.clients ? `${v.clients.prenom ?? ''} ${v.clients.nom}`.trim() : 'Client';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ backgroundColor: bg, borderRadius: 10, padding: 8, marginBottom: 6, opacity: pressed ? 0.85 : 1 })}>
      <Text style={{ color: fg, fontWeight: '700', fontSize: 12 }}>{hm(v.heure_debut)} – {hm(v.heure_fin)}</Text>
      <Text style={{ color: C.ink, fontWeight: '600' }} numberOfLines={1}>{nom}</Text>
      {v.clients?.ville ? <Text style={{ color: C.muted, fontSize: 12 }} numberOfLines={1}>{v.clients.ville}</Text> : null}
    </Pressable>
  );
}

export default function Planning() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const large = width >= 900;
  const [vue, setVue] = useState<Vue>('semaine');
  const [ancre, setAncre] = useState(new Date());
  const [visites, setVisites] = useState<Visite[]>([]);
  const [compteMois, setCompteMois] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const plage = useCallback((): [Date, Date] => {
    if (vue === 'jour') return [ancre, ancre];
    if (vue === 'semaine') { const d = startOfWeek(ancre); return [d, addDays(d, 6)]; }
    if (vue === 'mois') { const d = startOfWeek(new Date(ancre.getFullYear(), ancre.getMonth(), 1)); return [d, addDays(d, 41)]; }
    return [new Date(ancre.getFullYear(), 0, 1), new Date(ancre.getFullYear(), 11, 31)];
  }, [vue, ancre]);

  useEffect(() => {
    let annule = false;
    (async () => {
      setLoading(true); setErr(null);
      const [a, b] = plage();
      // Étend les séries récurrentes jusqu'à la fin de la plage affichée (idempotent)
      const { data: series } = await supabase.from('planning_series').select('id')
        .eq('type_planning', 'recurrent').lte('date_debut', iso(b)).or(`date_fin.is.null,date_fin.gte.${iso(a)}`);
      await Promise.all((series ?? []).map((x: { id: string }) => supabase.rpc('generer_visites', { p_serie: x.id, p_jusqua: iso(b) })));
      if (vue === 'annee') {
        const y = ancre.getFullYear();
        const counts = await Promise.all(Array.from({ length: 12 }, (_, m) =>
          supabase.from('visites').select('id', { count: 'exact', head: true })
            .gte('date_visite', iso(new Date(y, m, 1))).lte('date_visite', iso(new Date(y, m + 1, 0)))));
        if (!annule) { setCompteMois(counts.map((c) => c.count ?? 0)); setVisites([]); }
      } else {
        const { data, error } = await supabase.from('visites')
          .select('id,client_id,date_visite,heure_debut,heure_fin,statut,clients(nom,prenom,ville)')
          .gte('date_visite', iso(a)).lte('date_visite', iso(b))
          .order('date_visite').order('heure_debut');
        if (!annule) { if (error) setErr(error.message); setVisites((data as unknown as Visite[]) ?? []); }
      }
      if (!annule) setLoading(false);
    })();
    return () => { annule = true; };
  }, [vue, ancre]);

  const bouger = (n: number) => {
    if (vue === 'jour') setAncre(addDays(ancre, n));
    else if (vue === 'semaine') setAncre(addDays(ancre, 7 * n));
    else if (vue === 'mois') setAncre(addMonths(ancre, n));
    else setAncre(new Date(ancre.getFullYear() + n, 0, 1));
  };

  const titre = () => {
    if (vue === 'jour') return fmtJour(ancre);
    if (vue === 'semaine') { const d = startOfWeek(ancre); const f = addDays(d, 6); return `${d.getDate()} ${MOIS[d.getMonth()].slice(0, 4).toLowerCase()}. – ${f.getDate()} ${MOIS[f.getMonth()].slice(0, 4).toLowerCase()}. ${f.getFullYear()}`; }
    if (vue === 'mois') return `${MOIS[ancre.getMonth()]} ${ancre.getFullYear()}`;
    return String(ancre.getFullYear());
  };

  const ouvrir = (v: Visite) => router.push({ pathname: '/client/[id]', params: { id: v.client_id, visite: v.id } } as any);
  const parJour = (d: Date) => visites.filter((v) => v.date_visite === iso(d));
  const aujourdhui = iso(new Date());

  const colonneJour = (d: Date, compact = false) => (
    <View key={iso(d)} style={{ flex: 1, minWidth: compact ? 0 : undefined, backgroundColor: '#fff', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: iso(d) === aujourdhui ? C.primary : C.line, marginBottom: large ? 0 : 8 }}>
      <Pressable onPress={() => { setAncre(d); setVue('jour'); }}>
        <Text style={{ fontWeight: '700', color: iso(d) === aujourdhui ? C.primary : C.ink, marginBottom: 6 }}>{fmtJour(d)}</Text>
      </Pressable>
      {parJour(d).length === 0 ? <Text style={{ color: C.muted, fontSize: 12 }}>—</Text> : parJour(d).map((v) => <Chip key={v.id} v={v} onPress={() => ouvrir(v)} />)}
    </View>
  );

  const contenu = () => {
    if (loading) return <Loading />;
    if (vue === 'jour') return (
      <View>{parJour(ancre).length === 0 ? <Text style={{ color: C.muted, padding: 20 }}>Aucune visite ce jour.</Text> : parJour(ancre).map((v) => <Chip key={v.id} v={v} onPress={() => ouvrir(v)} />)}</View>
    );
    if (vue === 'semaine') {
      const d0 = startOfWeek(ancre);
      const jours = Array.from({ length: 7 }, (_, i) => addDays(d0, i));
      return <View style={{ flexDirection: large ? 'row' : 'column', gap: 8 }}>{jours.map((d) => colonneJour(d, true))}</View>;
    }
    if (vue === 'mois') {
      const d0 = startOfWeek(new Date(ancre.getFullYear(), ancre.getMonth(), 1));
      const sem = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) => addDays(d0, w * 7 + i)));
      return (
        <View>
          <View style={{ flexDirection: 'row' }}>{JOURS.map((j) => <Text key={j} style={{ flex: 1, textAlign: 'center', color: C.muted, fontWeight: '600', marginBottom: 4 }}>{j}</Text>)}</View>
          {sem.map((ligne, w) => (
            <View key={w} style={{ flexDirection: 'row' }}>
              {ligne.map((d) => {
                const dans = d.getMonth() === ancre.getMonth();
                const n = parJour(d);
                return (
                  <Pressable key={iso(d)} onPress={() => { setAncre(d); setVue('jour'); }}
                    style={{ flex: 1, minHeight: large ? 92 : 58, borderWidth: 1, borderColor: iso(d) === aujourdhui ? C.primary : C.line, backgroundColor: dans ? '#fff' : '#F0EEE8', padding: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: dans ? C.ink : C.muted }}>{d.getDate()}</Text>
                    {large ? n.slice(0, 3).map((v) => <Text key={v.id} numberOfLines={1} style={{ fontSize: 11, color: perdu(v.statut) ? C.danger : C.primaryDark }}>{hm(v.heure_debut)} {v.clients?.nom}</Text>)
                      : n.length > 0 ? <View style={{ backgroundColor: C.primary, borderRadius: 10, alignSelf: 'flex-start', paddingHorizontal: 6, marginTop: 4 }}><Text style={{ color: '#fff', fontSize: 11 }}>{n.length}</Text></View> : null}
                    {large && n.length > 3 ? <Text style={{ fontSize: 11, color: C.muted }}>+{n.length - 3}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      );
    }
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {MOIS.map((m, i) => (
          <Pressable key={m} onPress={() => { setAncre(new Date(ancre.getFullYear(), i, 1)); setVue('mois'); }}
            style={{ flexGrow: 1, flexBasis: 150, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.line }}>
            <Text style={{ fontWeight: '700', color: C.ink }}>{m}</Text>
            <Text style={{ color: C.primary, fontSize: 22, fontWeight: '800' }}>{compteMois[i] ?? 0}</Text>
            <Text style={{ color: C.muted, fontSize: 12 }}>visites</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <Screen title="Planning" back="/gestion" right={<Btn small kind="accent" label="+ Visite" onPress={() => router.push({ pathname: '/nouvelle-visite', params: { date: iso(vue === 'jour' ? ancre : new Date()) } } as any)} />}>
      <Tabs value={vue} onChange={(v) => setVue(v as Vue)}
        tabs={[{ value: 'jour', label: 'Jour' }, { value: 'semaine', label: 'Semaine' }, { value: 'mois', label: 'Mois' }, { value: 'annee', label: 'Année' }]} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
        <Btn small kind="ghost" label="‹" onPress={() => bouger(-1)} />
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: C.ink, textAlign: 'center' }}>{titre()}</Text>
          <Pressable onPress={() => setAncre(new Date())}><Text style={{ color: C.primary, fontSize: 13 }}>Aujourd'hui</Text></Pressable>
        </View>
        <Btn small kind="ghost" label="›" onPress={() => bouger(1)} />
      </View>
      <ErrorBox msg={err} />
      {contenu()}
    </Screen>
  );
}
