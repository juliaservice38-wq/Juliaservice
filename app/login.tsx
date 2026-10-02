import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { C } from '../lib/theme';
import { Btn, ErrorBox, Field } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setErr(null); setInfo(null); setBusy(true);
    const r = mode === 'in'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password: pwd })
      : await supabase.auth.signUp({ email: email.trim(), password: pwd });
    setBusy(false);
    if (r.error) setErr(r.error.message === 'Invalid login credentials' ? 'E-mail ou mot de passe incorrect.' : r.error.message);
    else if (mode === 'up' && !r.data.session) setInfo('Compte créé. Confirmez votre e-mail puis connectez-vous.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <View style={{ width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: C.line }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: C.primary }}>Julia service</Text>
        <Text style={{ color: C.muted, marginBottom: 20 }}>Planning, clients et trésorerie</Text>
        <ErrorBox msg={err} />
        {info ? <Text style={{ color: C.ok, marginBottom: 10 }}>{info}</Text> : null}
        <Field label="E-mail" value={email} onChange={setEmail} keyboard="email-address" />
        <Field label="Mot de passe" value={pwd} onChange={setPwd} secure />
        <Btn label={busy ? '…' : mode === 'in' ? 'Se connecter' : 'Créer le compte'} onPress={go} disabled={busy || !email || !pwd} />
        <View style={{ height: 8 }} />
        <Btn kind="ghost" small label={mode === 'in' ? 'Première utilisation : créer un compte' : 'J’ai déjà un compte'}
          onPress={() => { setMode(mode === 'in' ? 'up' : 'in'); setErr(null); setInfo(null); }} />
      </View>
    </View>
  );
}
