import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

export type RefValeur = { categorie: string; code: string; libelle: string; ordre: number };
const Ctx = createContext<RefValeur[]>([]);

export function RefProvider({ children }: { children: React.ReactNode }) {
  const [rows, setRows] = useState<RefValeur[]>([]);
  useEffect(() => {
    supabase
      .from('ref_valeurs')
      .select('categorie,code,libelle,ordre')
      .eq('actif', true)
      .order('ordre')
      .then(({ data }) => setRows((data as RefValeur[]) ?? []));
  }, []);
  return <Ctx.Provider value={rows}>{children}</Ctx.Provider>;
}

export const useRefs = (categorie: string) => {
  const all = useContext(Ctx);
  return all.filter((r) => r.categorie === categorie).map((r) => ({ value: r.code, label: r.libelle }));
};

export const useLibelle = () => {
  const all = useContext(Ctx);
  return (categorie: string, code?: string | null) =>
    all.find((r) => r.categorie === categorie && r.code === code)?.libelle ?? code ?? '';
};
