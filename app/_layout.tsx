import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { RefProvider } from '../lib/ref';
import { C } from '../lib/theme';
import { Btn, Loading } from '../components/ui';

export default function Layout() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [actif, setActif] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setActif(null); return; }
    supabase.from('intervenants').select('actif').eq('id', session.user.id).maybeSingle()
      .then(({ data }) => setActif(!!data?.actif));
  }, [session]);

  useEffect(() => {
    if (!ready) return;
    const surLogin = segments[0] === 'login';
    if (!session && !surLogin) router.replace('/login');
    if (session && surLogin) router.replace('/');
  }, [ready, session, segments]);

  if (!ready) return <Loading />;
  if (session && actif === null) return <Loading />;
  if (session && actif === false) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: C.ink }}>Compte en attente d'activation</Text>
        <Text style={{ color: C.muted, textAlign: 'center', maxWidth: 420 }}>
          Votre compte est créé mais n'est pas encore activé. Demandez à l'administrateur d'activer votre accès.
        </Text>
        <Btn label="Se déconnecter" kind="ghost" onPress={() => supabase.auth.signOut()} />
      </View>
    );
  }
  return (
    <RefProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RefProvider>
  );
}
