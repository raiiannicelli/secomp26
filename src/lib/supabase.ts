/// <reference types="vite/client" />

/**
 * SECOMP 2026 — Supabase Client Layer
 *
 * Três clientes com escopos de acesso distintos:
 *
 * 1. supabasePublic  — Publishable key. Seguro no frontend.
 *                      Acessa apenas dados públicos (atividades, leaderboard).
 *
 * 2. supabaseAdmin   — Service Role key. EXCLUSIVO do backend/servidor.
 *                      Bypassa RLS. NUNCA expor no bundle do cliente.
 *
 * 3. supabaseRealtime — Subscriptions em tempo real para o /admin dashboard.
 *                       Usa a mesma publishable key + filtros por canal.
 *
 * Padrão de segurança:
 *   - RLS (Row Level Security) ativado em todas as tabelas via Supabase Dashboard
 *   - Queries no frontend: apenas via supabasePublic com RLS bloqueando acesso não autorizado
 *   - Queries admin: via supabaseAdmin no servidor com preHandler roleGuard('ADMIN')
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Unified env helper — works in Vite (browser) and Node.js (SSR/tests)
function getEnv(viteKey: string, nodeKey: string): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[viteKey] as string | undefined) ?? '';
  }
  return (typeof process !== 'undefined' ? process.env[nodeKey] : undefined) ?? '';
}

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 'SUPABASE_URL') || 'https://xypxdnvlwlthjvuljuff.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = getEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_PUBLISHABLE_KEY') || 'sb_publishable_CnKf2iSFS1fZI-nE_9iSNA_Vy5AiqU2';

// ─── 1. Cliente Público (frontend + dados públicos) ──────────────────────────
export const supabasePublic: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,      // Auth é gerenciada pelo nosso sistema JWT/cookies
      autoRefreshToken: false,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
);

// ─── 2. Canal de Realtime para cockpit /chameguinho (LOGS & MÉTRICAS + CMS) ─
/**
 * Inscreve no canal 'secomp-chameguinho' para receber eventos em tempo real.
 * Publicação feita pelo backend via supabaseAdmin após mutations.
 *
 * Uso no AdminPage.tsx (/chameguinho):
 *   const channel = subscribeToAdminChannel((event) => {
 *     if (event.type === 'STAMP_ADDED') refetchStamps();
 *   });
 *   return () => channel.unsubscribe();
 */
export type AdminRealtimeEvent =
  | { type: 'USER_REGISTERED';       payload: { userId: string; email: string; role: string } }
  | { type: 'STAMP_ADDED';           payload: { userId: string; activityId: string; newLevel: string } }
  | { type: 'VOTE_CAST';             payload: { userId: string; pitchId: string } }
  | { type: 'TOKEN_OPENED';          payload: { token: string; category: string; expiresAt: string } }
  | { type: 'TOKEN_EXPIRED';         payload: { token: string } }
  | { type: 'ENROLLMENT_ADDED';      payload: { userId: string; activityId: string } }
  | { type: 'VOTING_STATUS_CHANGED'; payload: { pitchId: string; isOpen: boolean } }
  | { type: 'MEDIA_UPLOADED';         payload: { url: string; caption: string } };

export function subscribeToAdminChannel(
  handler: (event: AdminRealtimeEvent) => void
) {
  return supabasePublic
    .channel('secomp-chameguinho')
    .on('broadcast', { event: '*' }, ({ event, payload }) => {
      handler({ type: event as AdminRealtimeEvent['type'], payload } as AdminRealtimeEvent);
    })
    .subscribe();
}

// ─── 3. Storage (fotos do evento no Mini-CMS) ────────────────────────────────
/**
 * Faz upload de foto para o bucket 'event-photos' no Supabase Storage.
 * Backend valida MIME type (image/webp, image/jpeg, image/png) e tamanho (≤ 2MB).
 */
export async function uploadEventPhoto(
  file: File,
  fileName: string
): Promise<string> {
  const { data, error } = await supabasePublic.storage
    .from('event-photos')
    .upload(`registro/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) throw new Error(`Upload falhou: ${error.message}`);

  const { data: urlData } = supabasePublic.storage
    .from('event-photos')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
