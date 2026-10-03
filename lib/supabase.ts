import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// La clé « publishable » est publique par conception : la sécurité repose sur les règles RLS de la base.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://dyenxftufkkdzjjecnuu.supabase.co';
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? 'sb_publishable_yubJVdP6_MmmJwhkUREJMQ_V2Vs6tmN';

export const supabase = createClient(url, key, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});
