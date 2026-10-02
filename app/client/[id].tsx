import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useLibelle, useRefs } from '../../lib/ref';
import { C } from '../../lib/theme';
import { euro, fmtDate, hm, hoursBetween } from '../../lib/dates';
import { Btn, Card, DateField, ErrorBox, Field, H, Loading, Muted, NumField, Pill, Row, Screen, Select, Tabs } from '../../components/ui';

const OUI_NON = [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }];
const PERDUES = ['annulee', 'reportee', 'absence_beneficiaire', 'absence_intervenant'];
type Rec = Record<string, any>;

export default function Fiche() {
  const { id, visite } = useLocalSearchParams<{ id: string; visite?: string }>();
  const router = useRouter();
  const nouveau = id === 'nouveau';
  const [tab, setTab] = useState('identite');
  const [client, setClient] = useState<Rec>({ actif: true });
  const [loading, setLoading] = useState(!nouveau);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [visiteId, setVisiteId] = useState<string | undefined>(visite);

  useEffect(() => {
    if (nouveau) return;
    supabase.from('clients').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) setErr(error.message); else setClient(data);
      setLoading(false);
    });
  }, [id]);

  const set = (k: string) => (v: any) => setClient((c) => ({ ...c, [k]: v }));

  const sauver = async () => {
    setErr(null); setOk(null);
    if (!client.nom?.trim()) return setErr('Le nom est obligatoire.');
    const { id: _i, cree_le, cree_par, ...champs } = client;
    if (nouveau) {
      const { data, error } = await supabase.from('clients').insert(champs).select('id').single();
      if (error) return setErr(error.message);
      router.replace({ pathname: '/client/[id]', params: { id: data.id } } as any);
    } else {
      const { error } = await supabase.from('clients').update(champs).eq('id', id);
      if (error) return setErr(error.message);
      setOk('Fiche enregistrée.');
    }
  };

  const civ = useRefs('civilite'), lien = useRefs('lien_famille'), auto = useRefs('autonomie');
  if (loading) return <Screen title="Client"><Loading /></Screen>;

  const titre = nouveau ? 'Nouveau client' : `${client.prenom ?? ''} ${client.nom ?? ''}`.trim();
  const tabs = nouveau ? [{ value: 'identite', label: 'Identité' }] : [
    { value: 'identite', label: 'Identité' }, { value: 'contrat', label: 'Contrat' },
    { value: 'historique', label: 'Historique' }, { value: 'notes', label: 'Notes' },
  ];

  return (
    <Screen title={titre} back="/planning">
      {visiteId && !nouveau ? <VisitePanel id={visiteId} onClose={() => setVisiteId(undefined)} /> : null}
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      <ErrorBox msg={err} />
      {ok ? <Text style={{ color: C.ok, marginBottom: 8 }}>{ok}</Text> : null}

      {tab === 'identite' && (
        <View>
          <Card>
            <H>Identité</H>
            <Row><Select label="Civilité" value={client.civilite} options={civ} onChange={set('civilite')} /><Field label="Nom *" value={client.nom} onChange={set('nom')} /></Row>
            <Row><Field label="Prénom" value={client.prenom} onChange={set('prenom')} /><DateField label="Date de naissance" value={client.date_naissance} onChange={set('date_naissance')} /></Row>
            <Field label="Adresse" value={client.adresse} onChange={set('adresse')} />
            <Row><Field label="Code postal" value={client.code_postal} onChange={set('code_postal')} keyboard="numeric" /><Field label="Ville" value={client.ville} onChange={set('ville')} /></Row>
            <Row><Field label="Téléphone" value={client.telephone} onChange={set('telephone')} keyboard="phone-pad" /><Field label="E-mail" value={client.email} onChange={set('email')} keyboard="email-address" /></Row>
          </Card>
          <Card>
            <H>Entourage</H>
            <Row><Field label="Contact famille : nom" value={client.contact_famille_nom} onChange={set('contact_famille_nom')} /><Select label="Lien" value={client.contact_famille_lien} options={lien} onChange={set('contact_famille_lien')} /></Row>
            <Row><Field label="Contact famille : téléphone" value={client.contact_famille_tel} onChange={set('contact_famille_tel')} keyboard="phone-pad" /><Field label="Personne de confiance" value={client.personne_confiance} onChange={set('personne_confiance')} /></Row>
            <Field label="Médecin traitant" value={client.medecin_traitant} onChange={set('medecin_traitant')} />
          </Card>
          <Card>
            <H>Domicile et accès</H>
            <Row><Field label="Code d'accès / digicode" value={client.code_acces} onChange={set('code_acces')} /><Field label="Étage" value={client.etage} onChange={set('etage')} /></Row>
            <Field label="Clés (où, qui)" value={client.cles_info} onChange={set('cles_info')} />
            <Row><Select label="Niveau d'autonomie" value={client.autonomie} options={auto} onChange={set('autonomie')} /><Field label="Animaux" value={client.animaux} onChange={set('animaux')} /></Row>
            <Field label="Indications particulières" value={client.indications_particulieres} onChange={set('indications_particulieres')} multiline />
            <Select label="Client actif" allowEmpty={false} value={client.actif === false ? 'non' : 'oui'} options={OUI_NON} onChange={(v) => set('actif')(v !== 'non')} />
          </Card>
          <Btn label={nouveau ? 'Créer la fiche' : 'Enregistrer'} onPress={sauver} />
        </View>
      )}
      {tab === 'contrat' && <Contrats clientId={id} />}
      {tab === 'historique' && <Historique clientId={id} onOpen={(v) => { setVisiteId(v); window.scrollTo?.({ top: 0 }); }} />}
      {tab === 'notes' && <Notes clientId={id} />}
    </Screen>
  );
}

function VisitePanel({ id, onClose }: { id: string; onClose: () => void }) {
  const statuts = useRefs('statut_visite'), motifs = useRefs('motif_perte');
  const [v, setV] = useState<Rec | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { supabase.from('visites').select('*').eq('id', id).single().then(({ data }) => setV(data)); }, [id]);
  if (!v) return null;
  const set = (k: string) => (x: any) => setV((p) => ({ ...(p as Rec), [k]: x }));
  const perdue = PERDUES.includes(v.statut);
  const sauver = async () => {
    setErr(null); setMsg(null);
    const maj: Rec = {
      statut: v.statut, motif_perte: perdue ? v.motif_perte : null, facturee: v.facturee, rattrapee: v.rattrapee,
      heures_reelles: v.heures_reelles, note: v.note, date_visite: v.date_visite, heure_debut: v.heure_debut, heure_fin: v.heure_fin,
    };
    if (v.statut === 'realisee' && maj.heures_reelles == null) maj.heures_reelles = hoursBetween(v.heure_debut, v.heure_fin);
    if (perdue && v.facturee === true && v.statut !== 'absence_beneficiaire') { /* le choix reste manuel */ }
    const { error } = await supabase.from('visites').update(maj).eq('id', id);
    if (error) setErr(error.message); else { setMsg('Visite enregistrée.'); setV({ ...v, ...maj }); }
  };
  return (
    <Card style={{ borderColor: C.primary, borderWidth: 2 }}>
      <Row style={{ justifyContent: 'space-between' }}><H>Visite du {fmtDate(v.date_visite)} · {hm(v.heure_debut)}–{hm(v.heure_fin)}</H><Btn small kind="ghost" label="Fermer" onPress={onClose} /></Row>
      <ErrorBox msg={err} />
      {msg ? <Text style={{ color: C.ok, marginBottom: 8 }}>{msg}</Text> : null}
      <Row><Select label="Statut" allowEmpty={false} value={v.statut} options={statuts} onChange={(x) => set('statut')(x)} />
        {perdue && <Select label="Motif" value={v.motif_perte} options={motifs} onChange={set('motif_perte')} />}</Row>
      <Row>
        <Select label="Facturée" allowEmpty={false} value={v.facturee ? 'oui' : 'non'} options={OUI_NON} onChange={(x) => set('facturee')(x === 'oui')} />
        {perdue && <Select label="Rattrapée" allowEmpty={false} value={v.rattrapee ? 'oui' : 'non'} options={OUI_NON} onChange={(x) => set('rattrapee')(x === 'oui')} />}
        <NumField label="Heures réelles" value={v.heures_reelles} onChange={set('heures_reelles')} />
      </Row>
      <Row><DateField label="Date" value={v.date_visite} onChange={set('date_visite')} /><DateField label="Début" type="time" value={v.heure_debut} onChange={set('heure_debut')} /><DateField label="Fin" type="time" value={v.heure_fin} onChange={set('heure_fin')} /></Row>
      <Field label="Note de visite" value={v.note} onChange={set('note')} multiline />
      <Btn label="Enregistrer la visite" onPress={sauver} />
    </Card>
  );
}

function Contrats({ clientId }: { clientId: string }) {
  const types = useRefs('type_contrat'), fin = useRefs('financeur'), modes = useRefs('mode_tarif');
  const lib = useLibelle();
  const [rows, setRows] = useState<Rec[]>([]);
  const [edit, setEdit] = useState<Rec | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const charger = useCallback(() => {
    supabase.from('contrats').select('*').eq('client_id', clientId).order('date_debut', { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, [clientId]);
  useEffect(charger, [charger]);
  const set = (k: string) => (v: any) => setEdit((e) => ({ ...(e as Rec), [k]: v }));
  const sauver = async () => {
    setErr(null);
    if (!edit?.type_contrat) return setErr('Choisissez un type de contrat.');
    const { id, cree_le, ...champs } = edit;
    const q = id ? supabase.from('contrats').update(champs).eq('id', id) : supabase.from('contrats').insert({ ...champs, client_id: clientId });
    const { error } = await q;
    if (error) return setErr(error.message);
    setEdit(null); charger();
  };
  const taxe = edit?.tarif_mode === 'ht' || edit?.tarif_mode === 'ttc';
  return (
    <View>
      {edit ? (
        <Card>
          <H>{edit.id ? 'Modifier le contrat' : 'Nouveau contrat'}</H>
          <ErrorBox msg={err} />
          <Row><Select label="Type de contrat *" value={edit.type_contrat} options={types} onChange={set('type_contrat')} /><Select label="Financeur" value={edit.financeur} options={fin} onChange={set('financeur')} /></Row>
          <Row><NumField label="Tarif horaire (€)" value={edit.tarif_horaire} onChange={set('tarif_horaire')} /><Select label="Le tarif est en" value={edit.tarif_mode} options={modes} onChange={set('tarif_mode')} />
            {taxe && <NumField label="TVA (%)" value={edit.taux_tva} onChange={set('taux_tva')} />}</Row>
          <NumField label="Heures par semaine" value={edit.heures_par_semaine} onChange={set('heures_par_semaine')} />
          <Row><DateField label="Début" value={edit.date_debut} onChange={set('date_debut')} /><DateField label="Fin" value={edit.date_fin} onChange={set('date_fin')} /></Row>
          <Select label="Contrat actif" allowEmpty={false} value={edit.actif === false ? 'non' : 'oui'} options={OUI_NON} onChange={(v) => set('actif')(v !== 'non')} />
          <Field label="Notes" value={edit.notes} onChange={set('notes')} multiline />
          <Row><Btn label="Enregistrer" onPress={sauver} /><Btn kind="ghost" label="Annuler" onPress={() => setEdit(null)} /></Row>
        </Card>
      ) : (
        <Btn label="+ Nouveau contrat" onPress={() => setEdit({ actif: true, tarif_mode: 'net' })} />
      )}
      <View style={{ height: 12 }} />
      {rows.map((c) => (
        <Card key={c.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700', color: C.ink }}>{lib('type_contrat', c.type_contrat)}{c.financeur ? ` · ${lib('financeur', c.financeur)}` : ''}</Text>
            <Pill label={c.actif ? 'Actif' : 'Terminé'} tone={c.actif ? 'ok' : 'muted'} />
          </Row>
          <Muted>{euro(c.tarif_horaire)} / h {c.tarif_mode ? lib('mode_tarif', c.tarif_mode) : ''}{c.heures_par_semaine ? ` · ${c.heures_par_semaine} h/sem.` : ''}</Muted>
          <Muted>{fmtDate(c.date_debut)}{c.date_fin ? ` → ${fmtDate(c.date_fin)}` : ''}</Muted>
          <View style={{ height: 8 }} /><Btn small kind="ghost" label="Modifier" onPress={() => setEdit(c)} />
        </Card>
      ))}
    </View>
  );
}

function Historique({ clientId, onOpen }: { clientId: string; onOpen: (id: string) => void }) {
  const router = useRouter();
  const lib = useLibelle();
  const [rows, setRows] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('visites').select('*').eq('client_id', clientId).order('date_visite', { ascending: false }).limit(200)
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, [clientId]);
  const total = rows.filter((r) => r.statut === 'realisee').reduce((s, r) => s + (r.heures_reelles ?? 0), 0);
  return (
    <View>
      <Row style={{ marginBottom: 10 }}>
        <Btn small kind="accent" label="+ Planifier une visite" onPress={() => router.push({ pathname: '/nouvelle-visite', params: { client: clientId } } as any)} />
        <Muted>{total.toLocaleString('fr-FR')} h réalisées</Muted>
      </Row>
      {loading ? <Loading /> : rows.length === 0 ? <Muted>Aucune visite pour ce client.</Muted> : rows.map((v) => (
        <Card key={v.id} style={{ marginBottom: 8 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '600', color: C.ink }}>{fmtDate(v.date_visite)} · {hm(v.heure_debut)}–{hm(v.heure_fin)}</Text>
            <Pill label={lib('statut_visite', v.statut)} tone={v.statut === 'realisee' ? 'ok' : PERDUES.includes(v.statut) ? 'bad' : 'muted'} />
          </Row>
          {v.heures_reelles != null && <Muted>{v.heures_reelles} h réelles</Muted>}
          {v.motif_perte ? <Muted>Motif : {lib('motif_perte', v.motif_perte)}{v.facturee ? ' · facturée' : ' · non facturée'}{v.rattrapee ? ' · rattrapée' : ''}</Muted> : null}
          {v.note ? <Muted>{v.note}</Muted> : null}
          <View style={{ height: 6 }} /><Btn small kind="ghost" label="Ouvrir la visite" onPress={() => onOpen(v.id)} />
        </Card>
      ))}
    </View>
  );
}

function Notes({ clientId }: { clientId: string }) {
  const [rows, setRows] = useState<Rec[]>([]);
  const [txt, setTxt] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const charger = useCallback(() => {
    supabase.from('annotations_client').select('*').eq('client_id', clientId).order('cree_le', { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, [clientId]);
  useEffect(charger, [charger]);
  const ajouter = async () => {
    if (!txt.trim()) return;
    const { error } = await supabase.from('annotations_client').insert({ client_id: clientId, texte: txt.trim() });
    if (error) return setErr(error.message);
    setTxt(''); charger();
  };
  const suppr = async (id: string) => { await supabase.from('annotations_client').delete().eq('id', id); charger(); };
  return (
    <View>
      <Card>
        <ErrorBox msg={err} />
        <Field label="Nouvelle annotation" value={txt} onChange={setTxt} multiline />
        <Btn label="Ajouter" onPress={ajouter} disabled={!txt.trim()} />
      </Card>
      {rows.map((n) => (
        <Card key={n.id}>
          <Muted>{new Date(n.cree_le).toLocaleString('fr-FR')}</Muted>
          <Text style={{ color: C.ink, marginVertical: 6 }}>{n.texte}</Text>
          <Btn small kind="ghost" label="Supprimer" onPress={() => suppr(n.id)} />
        </Card>
      ))}
    </View>
  );
}
