import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useRefs } from '../lib/ref';
import { C } from '../lib/theme';
import { addDays, iso, JOURS, parse } from '../lib/dates';
import { Btn, Card, DateField, ErrorBox, Field, Row, Screen, Select, Tabs } from '../components/ui';

export default function NouvelleVisite() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string; client?: string }>();
  const types = useRefs('type_planning');
  const [clients, setClients] = useState<{ value: string; label: string }[]>([]);
  const [contrats, setContrats] = useState<{ value: string; label: string }[]>([]);
  const [clientId, setClientId] = useState<string | null>(params.client ?? null);
  const [contratId, setContratId] = useState<string | null>(null);
  const [type, setType] = useState('ponctuel');
  const [debut, setDebut] = useState(params.date ?? iso(new Date()));
  const [fin, setFin] = useState('');
  const [h1, setH1] = useState('09:00');
  const [h2, setH2] = useState('11:00');
  const [jours, setJours] = useState<number[]>([]);
  const [freq, setFreq] = useState('1');
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from('clients').select('id,nom,prenom,ville').eq('actif', true).order('nom').then(({ data }) =>
      setClients((data ?? []).map((c: any) => ({ value: c.id, label: `${c.nom} ${c.prenom ?? ''}${c.ville ? ' — ' + c.ville : ''}`.trim() }))));
  }, []);

  useEffect(() => {
    setContratId(null);
    if (!clientId) { setContrats([]); return; }
    supabase.from('contrats').select('id,type_contrat,financeur,actif').eq('client_id', clientId).eq('actif', true).then(({ data }) => {
      const l = (data ?? []).map((c: any) => ({ value: c.id, label: `${c.type_contrat}${c.financeur ? ' · ' + c.financeur : ''}` }));
      setContrats(l);
      if (l.length === 1) setContratId(l[0].value);
    });
  }, [clientId]);

  useEffect(() => {
    if (type === 'recurrent' && jours.length === 0 && debut) setJours([((parse(debut).getDay() + 6) % 7) + 1]);
  }, [type]);

  const enregistrer = async () => {
    setErr(null);
    if (!clientId) return setErr('Choisissez un client.');
    if (h2 <= h1) return setErr("L'heure de fin doit être après l'heure de début.");
    if (type === 'recurrent' && jours.length === 0) return setErr('Choisissez au moins un jour.');
    if (type === 'recurrent' && fin && fin < debut) return setErr('La date de fin est avant la date de début.');
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('planning_series').insert({
      client_id: clientId, contrat_id: contratId, intervenant_id: u.user?.id, type_planning: type,
      date_debut: debut, date_fin: type === 'recurrent' && fin ? fin : null, heure_debut: h1, heure_fin: h2,
      jours_semaine: type === 'recurrent' ? jours.sort() : null, frequence_semaines: parseInt(freq, 10) || 1, notes: notes || null,
    }).select('id').single();
    if (error || !data) { setBusy(false); return setErr(error?.message ?? 'Erreur'); }
    const horizon = iso(addDays(new Date(), 400));
    const jusqua = type === 'recurrent' ? (fin && fin < horizon ? fin : horizon) : debut;
    const r = await supabase.rpc('generer_visites', { p_serie: data.id, p_jusqua: jusqua });
    setBusy(false);
    if (r.error) return setErr(r.error.message);
    router.replace('/planning');
  };

  const toggle = (n: number) => setJours(jours.includes(n) ? jours.filter((x) => x !== n) : [...jours, n]);

  return (
    <Screen title="Nouvelle visite" back="/planning">
      <ErrorBox msg={err} />
      <Card>
        <Select label="Client" value={clientId} options={clients} allowEmpty={false} onChange={setClientId} />
        <Btn small kind="ghost" label="+ Nouveau client" onPress={() => router.push('/client/nouveau' as any)} />
        <View style={{ height: 10 }} />
        {contrats.length > 0 && <Select label="Contrat" value={contratId} options={contrats} onChange={setContratId} />}
      </Card>
      <Card>
        <Tabs tabs={types.length ? types : [{ value: 'ponctuel', label: 'Ponctuel' }, { value: 'recurrent', label: 'Récurrent' }]} value={type} onChange={setType} />
        <Row>
          <DateField label={type === 'recurrent' ? 'À partir du' : 'Date'} value={debut} onChange={setDebut} />
          {type === 'recurrent' && <DateField label="Jusqu'au (facultatif)" value={fin} onChange={setFin} />}
        </Row>
        <Row>
          <DateField label="Début" type="time" value={h1} onChange={setH1} />
          <DateField label="Fin" type="time" value={h2} onChange={setH2} />
        </Row>
        {type === 'recurrent' && (
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.muted, marginBottom: 6, textTransform: 'uppercase' }}>Jours</Text>
            <Row style={{ marginBottom: 12 }}>
              {JOURS.map((j, i) => (
                <Pressable key={j} onPress={() => toggle(i + 1)}
                  style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: jours.includes(i + 1) ? C.primary : C.line, backgroundColor: jours.includes(i + 1) ? C.primary : '#fff' }}>
                  <Text style={{ color: jours.includes(i + 1) ? '#fff' : C.ink, fontWeight: '600' }}>{j}</Text>
                </Pressable>
              ))}
            </Row>
            <Select label="Fréquence" allowEmpty={false} value={freq} onChange={(v) => setFreq(v ?? '1')}
              options={[{ value: '1', label: 'Toutes les semaines' }, { value: '2', label: 'Une semaine sur 2' }, { value: '3', label: 'Une semaine sur 3' }, { value: '4', label: 'Une semaine sur 4' }]} />
          </View>
        )}
        <Field label="Notes" value={notes} onChange={setNotes} multiline />
      </Card>
      <Btn label={busy ? 'Enregistrement…' : 'Enregistrer'} onPress={enregistrer} disabled={busy} />
    </Screen>
  );
}
