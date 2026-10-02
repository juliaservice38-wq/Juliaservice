import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useLibelle, useRefs } from '../lib/ref';
import { C } from '../lib/theme';
import { addDays, euro, fmtDate, hoursBetween, iso, MOIS } from '../lib/dates';
import { calcul, imprimerFacture } from '../lib/facture';
import { Btn, Card, DateField, ErrorBox, Field, H, Loading, Muted, NumField, Pill, Row, Screen, Select, Tabs } from '../components/ui';

type Rec = Record<string, any>;
const OUI_NON = [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }];

export default function Tresorerie() {
  const [tab, setTab] = useState('resume');
  return (
    <Screen title="Trésorerie" back="/">
      <Tabs value={tab} onChange={setTab} tabs={[
        { value: 'resume', label: 'Chiffre d’affaires' }, { value: 'factures', label: 'Factures' },
        { value: 'paiements', label: 'Paiements' }, { value: 'depenses', label: 'Dépenses' }, { value: 'reglages', label: 'Réglages' }]} />
      {tab === 'resume' && <Resume />}
      {tab === 'factures' && <Factures />}
      {tab === 'paiements' && <Paiements />}
      {tab === 'depenses' && <Depenses />}
      {tab === 'reglages' && <Reglages />}
    </Screen>
  );
}

function useEntreprise() {
  const [ent, setEnt] = useState<Rec | null>(null);
  const charger = useCallback(() => { supabase.from('entreprise').select('*').limit(1).maybeSingle().then(({ data }) => setEnt(data)); }, []);
  useEffect(charger, [charger]);
  return { ent, recharger: charger };
}

function Resume() {
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const { ent } = useEntreprise();
  const [pay, setPay] = useState<Rec[]>([]);
  const [dep, setDep] = useState<Rec[]>([]);
  const [fisc, setFisc] = useState<Rec | null>(null);
  const [loading, setLoading] = useState(true);
  const regime = ent?.regime ?? 'auto_entrepreneur';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from('paiements').select('date_paiement,montant').gte('date_paiement', `${annee}-01-01`).lte('date_paiement', `${annee}-12-31`),
      supabase.from('depenses').select('date_depense,montant').gte('date_depense', `${annee}-01-01`).lte('date_depense', `${annee}-12-31`),
      supabase.from('parametres_fiscaux').select('*').eq('regime', regime).eq('annee', annee).maybeSingle(),
    ]).then(([p, d, f]) => { setPay(p.data ?? []); setDep(d.data ?? []); setFisc(f.data); setLoading(false); });
  }, [annee, regime]);

  const mensuel = useMemo(() => MOIS.map((_, m) => pay.filter((p) => +p.date_paiement.slice(5, 7) === m + 1).reduce((s, p) => s + Number(p.montant), 0)), [pay]);
  const ca = mensuel.reduce((a, b) => a + b, 0);
  const depenses = dep.reduce((s, d) => s + Number(d.montant), 0);
  const taux = fisc?.taux_cotisations != null ? Number(fisc.taux_cotisations) : null;
  const vl = ent?.versement_liberatoire && fisc?.taux_versement_liberatoire != null ? Number(fisc.taux_versement_liberatoire) : 0;
  const plafond = fisc?.plafond_ca != null ? Number(fisc.plafond_ca) : null;
  let cumul = 0;

  return (
    <View>
      <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <Btn small kind="ghost" label="‹" onPress={() => setAnnee(annee - 1)} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.ink }}>{annee}</Text>
        <Btn small kind="ghost" label="›" onPress={() => setAnnee(annee + 1)} />
      </Row>
      {loading ? <Loading /> : (
        <View>
          <Row style={{ alignItems: 'stretch' }}>
            <Card style={{ flex: 1, minWidth: 200 }}><Muted>Chiffre d'affaires encaissé</Muted><Text style={{ fontSize: 24, fontWeight: '800', color: C.primary }}>{euro(ca)}</Text></Card>
            <Card style={{ flex: 1, minWidth: 200 }}><Muted>Cotisations estimées</Muted>
              <Text style={{ fontSize: 24, fontWeight: '800', color: C.accent }}>{taux == null ? '—' : euro(ca * (taux + vl))}</Text>
              {taux == null && <Muted>Taux {annee} à renseigner dans Réglages</Muted>}</Card>
            <Card style={{ flex: 1, minWidth: 200 }}><Muted>Dépenses</Muted><Text style={{ fontSize: 24, fontWeight: '800', color: C.ink }}>{euro(depenses)}</Text></Card>
          </Row>
          <Card>
            <H>Plafond de chiffre d'affaires</H>
            {plafond == null ? <Muted>Plafond {annee} à renseigner dans Réglages.</Muted> : (
              <View>
                <View style={{ height: 12, backgroundColor: '#ECEAE4', borderRadius: 6, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.min(100, (ca / plafond) * 100)}%`, height: 12, backgroundColor: ca / plafond > 0.9 ? C.danger : C.primary }} />
                </View>
                <Muted>{euro(ca)} sur {euro(plafond)} ({((ca / plafond) * 100).toFixed(1)} %) · reste {euro(Math.max(0, plafond - ca))}</Muted>
              </View>
            )}
            <Muted>Périodicité de déclaration : {ent?.periodicite_declaration ?? 'non renseignée'}</Muted>
          </Card>
          <Card>
            <H>Mois par mois</H>
            {MOIS.map((m, i) => { cumul += mensuel[i]; return (
              <Row key={m} style={{ justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.line }}>
                <Text style={{ width: 110, color: C.ink }}>{m}</Text>
                <Text style={{ color: C.ink, width: 100, textAlign: 'right' }}>{euro(mensuel[i])}</Text>
                <Text style={{ color: C.muted, width: 110, textAlign: 'right' }}>cumul {euro(cumul)}</Text>
              </Row>); })}
          </Card>
        </View>
      )}
    </View>
  );
}

function Factures() {
  const lib = useLibelle();
  const statuts = useRefs('statut_facture');
  const { ent } = useEntreprise();
  const [rows, setRows] = useState<Rec[]>([]);
  const [clients, setClients] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [nouv, setNouv] = useState(false);
  const [cid, setCid] = useState<string | null>(null);
  const [d1, setD1] = useState(iso(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [d2, setD2] = useState(iso(new Date()));
  const [prev, setPrev] = useState<Rec | null>(null);

  const charger = useCallback(() => {
    supabase.from('factures').select('*, clients(nom,prenom,ville)').order('date_emission', { ascending: false }).limit(200)
      .then(({ data, error }) => { if (error) setErr(error.message); setRows(data ?? []); setLoading(false); });
  }, []);
  useEffect(() => { charger(); supabase.from('clients').select('id,nom,prenom,ville').order('nom').then(({ data }) => setClients(data ?? [])); }, [charger]);

  const calculer = async () => {
    setErr(null); setPrev(null);
    if (!cid) return setErr('Choisissez un client.');
    const [v, c] = await Promise.all([
      supabase.from('visites').select('id,date_visite,heure_debut,heure_fin,heures_reelles,statut,facturee').eq('client_id', cid).is('facture_id', null)
        .gte('date_visite', d1).lte('date_visite', d2).order('date_visite'),
      supabase.from('contrats').select('*').eq('client_id', cid).eq('actif', true).limit(1),
    ]);
    if (v.error) return setErr(v.error.message);
    const aFacturer = (v.data ?? []).filter((x: Rec) => x.statut === 'realisee' || (x.statut !== 'planifiee' && x.facturee));
    const lignes = aFacturer.map((x: Rec) => ({ id: x.id, date: x.date_visite, heures: Number(x.heures_reelles ?? hoursBetween(x.heure_debut, x.heure_fin)) }));
    const contrat = c.data?.[0] ?? null;
    const heures = lignes.reduce((s, l) => s + l.heures, 0);
    setPrev({ lignes, contrat, heures, montants: contrat?.tarif_horaire != null ? calcul(heures, Number(contrat.tarif_horaire), contrat.tarif_mode, contrat.taux_tva) : null });
  };

  const creer = async () => {
    if (!prev || !prev.montants) return setErr('Aucun contrat avec tarif horaire pour ce client.');
    if (prev.lignes.length === 0) return setErr('Aucune visite à facturer sur cette période.');
    const annee = new Date().getFullYear();
    const { count } = await supabase.from('factures').select('id', { count: 'exact', head: true }).gte('date_emission', `${annee}-01-01`);
    const numero = `F-${annee}-${String((count ?? 0) + 1).padStart(3, '0')}`;
    const { data, error } = await supabase.from('factures').insert({
      numero, client_id: cid, contrat_id: prev.contrat.id, periode_debut: d1, periode_fin: d2, date_echeance: iso(addDays(new Date(), 30)),
      total_ht: prev.montants.ht, montant_tva: prev.montants.tva, total_ttc: prev.montants.ttc, statut: 'emise',
    }).select('id').single();
    if (error || !data) return setErr(error?.message ?? 'Erreur');
    await supabase.from('visites').update({ facture_id: data.id }).in('id', prev.lignes.map((l: Rec) => l.id));
    setNouv(false); setPrev(null); charger();
  };

  const changerStatut = async (id: string, statut: string | null) => { if (statut) { await supabase.from('factures').update({ statut }).eq('id', id); charger(); } };
  const supprimer = async (id: string) => { await supabase.from('factures').delete().eq('id', id); charger(); };
  const pdf = async (f: Rec) => {
    const [cl, vs, ct] = await Promise.all([
      supabase.from('clients').select('*').eq('id', f.client_id).single(),
      supabase.from('visites').select('date_visite,heure_debut,heure_fin,heures_reelles').eq('facture_id', f.id).order('date_visite'),
      f.contrat_id ? supabase.from('contrats').select('tarif_horaire').eq('id', f.contrat_id).single() : Promise.resolve({ data: null }),
    ]);
    imprimerFacture(f, cl.data, ent, (vs.data ?? []).map((x: Rec) => ({ date: x.date_visite, heures: Number(x.heures_reelles ?? hoursBetween(x.heure_debut, x.heure_fin)) })), (ct.data as Rec | null)?.tarif_horaire ?? null);
  };

  return (
    <View>
      <ErrorBox msg={err} />
      {nouv ? (
        <Card>
          <H>Nouvelle facture</H>
          <Select label="Client" allowEmpty={false} value={cid} onChange={(v) => { setCid(v); setPrev(null); }}
            options={clients.map((c) => ({ value: c.id, label: `${c.nom} ${c.prenom ?? ''}${c.ville ? ' — ' + c.ville : ''}` }))} />
          <Row><DateField label="Du" value={d1} onChange={setD1} /><DateField label="Au" value={d2} onChange={setD2} /></Row>
          <Row><Btn label="Calculer" onPress={calculer} /><Btn kind="ghost" label="Annuler" onPress={() => { setNouv(false); setPrev(null); }} /></Row>
          {prev && (
            <View style={{ marginTop: 12 }}>
              <Muted>{prev.lignes.length} visite(s) · {prev.heures.toLocaleString('fr-FR')} h</Muted>
              {prev.montants ? (
                <View>
                  <Text style={{ color: C.ink }}>Tarif {euro(prev.contrat.tarif_horaire)} / h ({prev.contrat.tarif_mode ?? 'mode non précisé'})</Text>
                  <Text style={{ color: C.ink }}>HT {euro(prev.montants.ht)} · TVA {euro(prev.montants.tva)} · TTC {euro(prev.montants.ttc)}</Text>
                  <View style={{ height: 8 }} /><Btn kind="accent" label="Créer la facture" onPress={creer} />
                </View>
              ) : <Muted>Ce client n'a pas de contrat actif avec un tarif horaire.</Muted>}
            </View>
          )}
        </Card>
      ) : <Btn label="+ Nouvelle facture" onPress={() => setNouv(true)} />}
      <View style={{ height: 12 }} />
      {loading ? <Loading /> : rows.length === 0 ? <Muted>Aucune facture.</Muted> : rows.map((f) => (
        <Card key={f.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700', color: C.ink }}>{f.numero} · {f.clients?.prenom ?? ''} {f.clients?.nom}</Text>
            <Pill label={lib('statut_facture', f.statut)} tone={f.statut === 'payee' ? 'ok' : f.statut === 'annulee' ? 'bad' : 'warn'} />
          </Row>
          <Muted>{fmtDate(f.date_emission)} · période {fmtDate(f.periode_debut)} → {fmtDate(f.periode_fin)}</Muted>
          <Text style={{ fontWeight: '700', color: C.primary, marginVertical: 4 }}>{euro(f.total_ttc)}</Text>
          <Row>
            <Btn small kind="ghost" label="PDF / imprimer" onPress={() => pdf(f)} />
            <View style={{ minWidth: 200, flex: 1 }}><Select label="Statut" allowEmpty={false} value={f.statut} options={statuts} onChange={(v) => changerStatut(f.id, v)} /></View>
            {f.statut === 'brouillon' || f.statut === 'annulee' ? <Btn small kind="danger" label="Supprimer" onPress={() => supprimer(f.id)} /> : null}
          </Row>
        </Card>
      ))}
    </View>
  );
}

function Paiements() {
  const lib = useLibelle();
  const modes = useRefs('mode_paiement');
  const [rows, setRows] = useState<Rec[]>([]);
  const [clients, setClients] = useState<Rec[]>([]);
  const [factures, setFactures] = useState<Rec[]>([]);
  const [f, setF] = useState<Rec | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const charger = useCallback(() => {
    supabase.from('paiements').select('*, clients(nom,prenom)').order('date_paiement', { ascending: false }).limit(200).then(({ data }) => setRows(data ?? []));
  }, []);
  useEffect(() => { charger(); supabase.from('clients').select('id,nom,prenom').order('nom').then(({ data }) => setClients(data ?? [])); }, [charger]);
  useEffect(() => {
    setFactures([]);
    if (f?.client_id) supabase.from('factures').select('id,numero,total_ttc,statut').eq('client_id', f.client_id).neq('statut', 'payee').neq('statut', 'annulee').then(({ data }) => setFactures(data ?? []));
  }, [f?.client_id]);
  const set = (k: string) => (v: any) => setF((p) => ({ ...(p as Rec), [k]: v }));

  const sauver = async () => {
    setErr(null);
    if (!f?.client_id || !f.montant) return setErr('Client et montant obligatoires.');
    const { error } = await supabase.from('paiements').insert({
      client_id: f.client_id, facture_id: f.facture_id ?? null, date_paiement: f.date_paiement, montant: f.montant, mode_paiement: f.mode_paiement ?? null, reference: f.reference ?? null,
    });
    if (error) return setErr(error.message);
    if (f.facture_id) {
      const [{ data: ps }, { data: fa }] = await Promise.all([
        supabase.from('paiements').select('montant').eq('facture_id', f.facture_id),
        supabase.from('factures').select('total_ttc').eq('id', f.facture_id).single(),
      ]);
      const somme = (ps ?? []).reduce((s: number, p: Rec) => s + Number(p.montant), 0);
      await supabase.from('factures').update({ statut: somme + 0.005 >= Number(fa?.total_ttc ?? 0) ? 'payee' : 'payee_partiellement' }).eq('id', f.facture_id);
    }
    setF(null); charger();
  };
  const suppr = async (id: string) => { await supabase.from('paiements').delete().eq('id', id); charger(); };

  return (
    <View>
      <ErrorBox msg={err} />
      {f ? (
        <Card>
          <H>Nouveau paiement</H>
          <Select label="Client" allowEmpty={false} value={f.client_id} onChange={(v) => setF({ ...f, client_id: v, facture_id: null })}
            options={clients.map((c) => ({ value: c.id, label: `${c.nom} ${c.prenom ?? ''}` }))} />
          {factures.length > 0 && <Select label="Facture concernée" value={f.facture_id} onChange={set('facture_id')}
            options={factures.map((x) => ({ value: x.id, label: `${x.numero} · ${euro(x.total_ttc)}` }))} />}
          <Row><DateField label="Date" value={f.date_paiement} onChange={set('date_paiement')} /><NumField label="Montant (€)" value={f.montant} onChange={set('montant')} /></Row>
          <Row><Select label="Mode" value={f.mode_paiement} options={modes} onChange={set('mode_paiement')} /><Field label="Référence" value={f.reference} onChange={set('reference')} /></Row>
          <Row><Btn label="Enregistrer" onPress={sauver} /><Btn kind="ghost" label="Annuler" onPress={() => setF(null)} /></Row>
        </Card>
      ) : <Btn label="+ Paiement reçu" onPress={() => setF({ date_paiement: iso(new Date()) })} />}
      <View style={{ height: 12 }} />
      {rows.map((p) => (
        <Card key={p.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700', color: C.ink }}>{p.clients?.prenom ?? ''} {p.clients?.nom}</Text>
            <Text style={{ fontWeight: '800', color: C.ok }}>{euro(p.montant)}</Text>
          </Row>
          <Muted>{fmtDate(p.date_paiement)} · {lib('mode_paiement', p.mode_paiement)}{p.reference ? ` · ${p.reference}` : ''}</Muted>
          <View style={{ height: 6 }} /><Btn small kind="ghost" label="Supprimer" onPress={() => suppr(p.id)} />
        </Card>
      ))}
    </View>
  );
}

function Depenses() {
  const lib = useLibelle();
  const cats = useRefs('categorie_depense');
  const [rows, setRows] = useState<Rec[]>([]);
  const [f, setF] = useState<Rec | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const charger = useCallback(() => { supabase.from('depenses').select('*').order('date_depense', { ascending: false }).limit(300).then(({ data }) => setRows(data ?? [])); }, []);
  useEffect(charger, [charger]);
  const set = (k: string) => (v: any) => setF((p) => ({ ...(p as Rec), [k]: v }));
  const sauver = async () => {
    setErr(null);
    if (!f?.categorie || !f.montant) return setErr('Catégorie et montant obligatoires.');
    const { error } = await supabase.from('depenses').insert({ date_depense: f.date_depense, categorie: f.categorie, libelle: f.libelle ?? null, montant: f.montant, kilometres: f.categorie === 'frais_km' ? f.kilometres ?? null : null });
    if (error) return setErr(error.message);
    setF(null); charger();
  };
  const suppr = async (id: string) => { await supabase.from('depenses').delete().eq('id', id); charger(); };
  const total = rows.reduce((s, d) => s + Number(d.montant), 0);
  return (
    <View>
      <ErrorBox msg={err} />
      {f ? (
        <Card>
          <H>Nouvelle dépense</H>
          <Row><DateField label="Date" value={f.date_depense} onChange={set('date_depense')} /><Select label="Catégorie" allowEmpty={false} value={f.categorie} options={cats} onChange={set('categorie')} /></Row>
          <Field label="Libellé" value={f.libelle} onChange={set('libelle')} />
          <Row><NumField label="Montant (€)" value={f.montant} onChange={set('montant')} />{f.categorie === 'frais_km' && <NumField label="Kilomètres" value={f.kilometres} onChange={set('kilometres')} />}</Row>
          <Row><Btn label="Enregistrer" onPress={sauver} /><Btn kind="ghost" label="Annuler" onPress={() => setF(null)} /></Row>
        </Card>
      ) : <Btn label="+ Dépense" onPress={() => setF({ date_depense: iso(new Date()) })} />}
      <Muted style={{ marginVertical: 10 }}>Total affiché : {euro(total)}</Muted>
      {rows.map((d) => (
        <Card key={d.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700', color: C.ink }}>{lib('categorie_depense', d.categorie)}</Text>
            <Text style={{ fontWeight: '800', color: C.danger }}>{euro(d.montant)}</Text>
          </Row>
          <Muted>{fmtDate(d.date_depense)}{d.libelle ? ` · ${d.libelle}` : ''}{d.kilometres ? ` · ${d.kilometres} km` : ''}</Muted>
          <View style={{ height: 6 }} /><Btn small kind="ghost" label="Supprimer" onPress={() => suppr(d.id)} />
        </Card>
      ))}
    </View>
  );
}

function Reglages() {
  const regimes = useRefs('regime_fiscal'), periodes = useRefs('periodicite_declaration');
  const [e, setE] = useState<Rec | null>(null);
  const [fi, setFi] = useState<Rec | null>(null);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: u }) => {
      const { data } = await supabase.from('entreprise').select('*').limit(1).maybeSingle();
      setE(data ?? { regime: 'auto_entrepreneur', intervenant_id: u.user?.id, versement_liberatoire: false, tva_applicable: false });
    });
  }, []);
  useEffect(() => {
    if (!e) return;
    supabase.from('parametres_fiscaux').select('*').eq('regime', e.regime).eq('annee', annee).maybeSingle()
      .then(({ data }) => setFi(data ?? { regime: e.regime, annee }));
  }, [e?.regime, annee]);

  const setEnt = (k: string) => (v: any) => setE((p) => ({ ...(p as Rec), [k]: v }));
  const setFis = (k: string) => (v: any) => setFi((p) => ({ ...(p as Rec), [k]: v }));
  const pct = (v: number | null | undefined) => (v == null ? null : Math.round(Number(v) * 10000) / 100);

  const sauver = async () => {
    setErr(null); setMsg(null);
    if (!e || !fi) return;
    const { id, cree_le, ...ent } = e;
    const r1 = id ? await supabase.from('entreprise').update(ent).eq('id', id) : await supabase.from('entreprise').insert(ent);
    if (r1.error) return setErr(r1.error.message);
    const { id: fid, ...fis } = fi;
    const r2 = fid ? await supabase.from('parametres_fiscaux').update(fis).eq('id', fid) : await supabase.from('parametres_fiscaux').insert(fis);
    if (r2.error) return setErr(`Paramètres fiscaux : ${r2.error.message}`);
    setMsg('Réglages enregistrés.');
  };

  if (!e) return <Loading />;
  return (
    <View>
      <ErrorBox msg={err} />
      {msg ? <Text style={{ color: C.ok, marginBottom: 8 }}>{msg}</Text> : null}
      <Card>
        <H>Entreprise</H>
        <Row><Field label="Raison sociale / nom" value={e.raison_sociale} onChange={setEnt('raison_sociale')} /><Field label="SIRET" value={e.siret} onChange={setEnt('siret')} keyboard="numeric" /></Row>
        <Row><Select label="Régime" allowEmpty={false} value={e.regime} options={regimes} onChange={setEnt('regime')} /><Select label="Déclaration" value={e.periodicite_declaration} options={periodes} onChange={setEnt('periodicite_declaration')} /></Row>
        <Row>
          <Select label="Versement libératoire" allowEmpty={false} value={e.versement_liberatoire ? 'oui' : 'non'} options={OUI_NON} onChange={(v) => setEnt('versement_liberatoire')(v === 'oui')} />
          <Select label="TVA applicable" allowEmpty={false} value={e.tva_applicable ? 'oui' : 'non'} options={OUI_NON} onChange={(v) => setEnt('tva_applicable')(v === 'oui')} />
        </Row>
        <DateField label="Début d'activité" value={e.date_debut_activite} onChange={setEnt('date_debut_activite')} />
      </Card>
      <Card>
        <H>Taux et plafonds {annee} · {regimes.find((r) => r.value === e.regime)?.label}</H>
        <Muted>À vérifier chaque année sur autoentrepreneur.urssaf.fr, ils changent régulièrement.</Muted>
        <View style={{ height: 8 }} />
        {fi && (
          <View>
            <Row><NumField label="Cotisations (%)" value={pct(fi.taux_cotisations)} onChange={(v) => setFis('taux_cotisations')(v == null ? null : v / 100)} />
              <NumField label="Versement libératoire (%)" value={pct(fi.taux_versement_liberatoire)} onChange={(v) => setFis('taux_versement_liberatoire')(v == null ? null : v / 100)} /></Row>
            <Row><NumField label="Plafond de CA (€)" value={fi.plafond_ca} onChange={setFis('plafond_ca')} /><NumField label="Plafond TVA (€)" value={fi.plafond_tva} onChange={setFis('plafond_tva')} /></Row>
          </View>
        )}
        <Row><Btn small kind="ghost" label={`‹ ${annee - 1}`} onPress={() => setAnnee(annee - 1)} /><Btn small kind="ghost" label={`${annee + 1} ›`} onPress={() => setAnnee(annee + 1)} /></Row>
      </Card>
      <Btn label="Enregistrer les réglages" onPress={sauver} />
    </View>
  );
}
