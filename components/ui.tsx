import React, { createElement, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  ViewStyle,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { C, R } from '../lib/theme';

export function Screen({ title, children, back = true, right, scroll = true }: {
  title: string; children: React.ReactNode; back?: boolean | string; right?: React.ReactNode; scroll?: boolean;
}) {
  const router = useRouter();
  const goBack = () => {
    if (typeof back === 'string') router.replace(back as any);
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  const body = <View style={s.wrap}>{children}</View>;
  return (
    <View style={s.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={s.header}>
        <View style={s.headerIn}>
          {back ? <Pressable onPress={goBack} style={s.backBtn} hitSlop={10}><Text style={s.backTxt}>‹ Retour</Text></Pressable> : <View style={{ width: 70 }} />}
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          <View style={{ minWidth: 70, alignItems: 'flex-end' }}>{right}</View>
        </View>
      </View>
      {scroll ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">{body}</ScrollView>
      ) : body}
    </View>
  );
}

export const Card = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[s.card, style]}>{children}</View>
);

export const H = ({ children }: { children: React.ReactNode }) => <Text style={s.h}>{children}</Text>;
export const Muted = ({ children, style }: { children: React.ReactNode; style?: any }) => <Text style={[s.muted, style]}>{children}</Text>;

export function Btn({ label, onPress, kind = 'primary', disabled, small }: {
  label: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'danger' | 'accent'; disabled?: boolean; small?: boolean;
}) {
  const bg = kind === 'primary' ? C.primary : kind === 'accent' ? C.accent : kind === 'danger' ? C.danger : 'transparent';
  const fg = kind === 'ghost' ? C.primary : '#fff';
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={({ pressed }) => [s.btn, small && { paddingVertical: 8, paddingHorizontal: 12 },
        { backgroundColor: bg, borderColor: kind === 'ghost' ? C.primary : bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }]}>
      <Text style={{ color: fg, fontWeight: '600', fontSize: small ? 13 : 15 }}>{label}</Text>
    </Pressable>
  );
}

export const Loading = () => <View style={{ padding: 40 }}><ActivityIndicator color={C.primary} /></View>;
export const ErrorBox = ({ msg }: { msg?: string | null }) =>
  msg ? <View style={s.err}><Text style={{ color: C.danger }}>{msg}</Text></View> : null;

export function Field({ label, value, onChange, multiline, keyboard, secure, placeholder }: {
  label: string; value: string | null | undefined; onChange: (v: string) => void; multiline?: boolean;
  keyboard?: 'default' | 'numeric' | 'email-address' | 'phone-pad'; secure?: boolean; placeholder?: string;
}) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput value={value ?? ''} onChangeText={onChange} multiline={multiline} secureTextEntry={secure}
        keyboardType={keyboard} placeholder={placeholder} placeholderTextColor="#A3ABB1" autoCapitalize="none"
        style={[s.input, multiline && { minHeight: 90, textAlignVertical: 'top' }]} />
    </View>
  );
}

export function NumField({ label, value, onChange }: { label: string; value: number | null | undefined; onChange: (v: number | null) => void }) {
  return (
    <Field label={label} keyboard="numeric" value={value == null ? '' : String(value)}
      onChange={(t) => { const n = parseFloat(t.replace(',', '.')); onChange(isNaN(n) ? null : n); }} />
  );
}

export function DateField({ label, value, onChange, type = 'date' }: {
  label: string; value: string | null | undefined; onChange: (v: string) => void; type?: 'date' | 'time';
}) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {Platform.OS === 'web' ? (
        createElement('input', {
          type, value: value ? value.slice(0, type === 'time' ? 5 : 10) : '',
          onChange: (e: any) => onChange(e.target.value),
          style: { border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px', fontSize: 15, background: '#fff', color: C.ink, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
        })
      ) : (
        <TextInput value={value ?? ''} onChangeText={onChange} style={s.input}
          placeholder={type === 'date' ? 'AAAA-MM-JJ' : 'HH:MM'} placeholderTextColor="#A3ABB1" />
      )}
    </View>
  );
}

export type Opt = { value: string; label: string };
export function Select({ label, value, options, onChange, allowEmpty = true }: {
  label: string; value: string | null | undefined; options: Opt[]; onChange: (v: string | null) => void; allowEmpty?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cur = options.find((o) => o.value === value);
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={[s.input, { flexDirection: 'row', justifyContent: 'space-between' }]}>
        <Text style={{ color: cur ? C.ink : '#A3ABB1', flexShrink: 1 }}>{cur?.label ?? 'Choisir…'}</Text>
        <Text style={{ color: C.muted }}>▾</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <Text style={[s.h, { marginBottom: 8 }]}>{label}</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              {allowEmpty && (
                <Pressable style={s.opt} onPress={() => { onChange(null); setOpen(false); }}>
                  <Text style={{ color: C.muted }}>— Aucun —</Text>
                </Pressable>
              )}
              {options.map((o) => (
                <Pressable key={o.value} style={[s.opt, o.value === value && { backgroundColor: C.primarySoft }]}
                  onPress={() => { onChange(o.value); setOpen(false); }}>
                  <Text style={{ color: C.ink }}>{o.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export function Tabs({ tabs, value, onChange }: { tabs: Opt[]; value: string; onChange: (v: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {tabs.map((t) => (
          <Pressable key={t.value} onPress={() => onChange(t.value)}
            style={[s.tab, t.value === value && { backgroundColor: C.primary, borderColor: C.primary }]}>
            <Text style={{ color: t.value === value ? '#fff' : C.ink, fontWeight: '600', fontSize: 13 }}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

export const Row = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[{ flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' }, style]}>{children}</View>
);

export const Pill = ({ label, tone = 'muted' }: { label: string; tone?: 'ok' | 'bad' | 'warn' | 'muted' }) => {
  const m = { ok: [C.okSoft, C.ok], bad: [C.dangerSoft, C.danger], warn: [C.accentSoft, C.accent], muted: ['#ECEAE4', C.muted] }[tone];
  return <View style={{ backgroundColor: m[0], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}><Text style={{ color: m[1], fontSize: 12, fontWeight: '600' }}>{label}</Text></View>;
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { backgroundColor: C.primary, paddingTop: Platform.OS === 'web' ? 0 : 36 },
  headerIn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 54, maxWidth: 1100, width: '100%', alignSelf: 'center' },
  backBtn: { minWidth: 70 },
  backTxt: { color: '#fff', fontSize: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', flexShrink: 1 },
  wrap: { padding: 16, maxWidth: 1100, width: '100%', alignSelf: 'center' },
  card: { backgroundColor: C.card, borderRadius: R, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.line },
  h: { fontSize: 16, fontWeight: '700', color: C.ink, marginBottom: 6 },
  muted: { color: C.muted, fontSize: 13 },
  btn: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  err: { backgroundColor: C.dangerSoft, padding: 10, borderRadius: 8, marginBottom: 10 },
  field: { marginBottom: 12, flex: 1, minWidth: 220 },
  label: { fontSize: 12, fontWeight: '600', color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, backgroundColor: '#fff', color: C.ink },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,30,34,0.45)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: '#fff', borderRadius: 14, padding: 16, maxWidth: 520, width: '100%', alignSelf: 'center' },
  opt: { paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff' },
});
