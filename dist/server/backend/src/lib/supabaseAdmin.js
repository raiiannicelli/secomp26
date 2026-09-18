import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
// In-memory bus para testes e fallback local sem rede externa
const eventListeners = new Set();
export function onAdminEvent(handler) {
    eventListeners.add(handler);
    return () => {
        eventListeners.delete(handler);
    };
}
let supabaseAdminClient = null;
export function getSupabaseAdmin() {
    if (supabaseAdminClient)
        return supabaseAdminClient;
    // Em ambiente de teste unitário, utiliza exclusivamente o barramento in-memory sem WebSocket externo
    if (process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST)) {
        return null;
    }
    const url = env.SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        return null;
    }
    try {
        supabaseAdminClient = createClient(url, key, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
        return supabaseAdminClient;
    }
    catch {
        return null;
    }
}
/**
 * Publica evento no canal Realtime do Cockpit /chameguinho em tempo hábil (<= 500ms)
 * Não bloqueia ou derruba a requisição caso o Supabase esteja temporariamente offline
 */
export async function publishAdminEvent(event) {
    const enrichedEvent = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
    };
    // Notifica ouvintes locais (testes, mocks, telemetria interna)
    for (const listener of eventListeners) {
        try {
            listener(enrichedEvent);
        }
        catch (e) {
            // Ignora erro de listener individual
        }
    }
    const client = getSupabaseAdmin();
    if (!client) {
        return;
    }
    try {
        const channel = client.channel('secomp-chameguinho');
        await channel.send({
            type: 'broadcast',
            event: enrichedEvent.type,
            payload: enrichedEvent.payload,
        });
    }
    catch (error) {
        // Falha silenciosa para manter resiliência de produção em caso de partição de rede
        console.warn(`[Realtime Publisher] Aviso ao despachar ${enrichedEvent.type}:`, error);
    }
}
//# sourceMappingURL=supabaseAdmin.js.map