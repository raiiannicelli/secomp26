import crypto from 'crypto';
/**
 * Categorias canônicas de atividades para emissão de Tokens Descartáveis (OTT)
 */
export const OTT_CATEGORIES = [
    'IA',
    'BD',
    'CLEANCODE',
    'STARTUP',
    'MAG',
    'ARENA',
    'SEC',
];
/**
 * Alfabeto anti-ambiguidade (Base32 Crockford simplificado)
 * Exclui deliberadamente os caracteres confusos: 0 (zero), O (ó), 1 (um), I (i maiúsculo).
 * Total: 32 caracteres seguros para leitura em telão/projetor.
 */
export const SAFE_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
/**
 * Gera um token descartável anti-fraude (OTT v2.0)
 * Formato canônico: SEC-[CAT]-[XXX] (ex: SEC-IA-A3K)
 * TTL padrão: 15 minutos (900.000 ms)
 */
export function generateOTT(rawCategory = 'SEC', durationMinutes = 15) {
    const upperCat = rawCategory.toUpperCase().trim();
    const category = OTT_CATEGORIES.includes(upperCat) ? upperCat : 'SEC';
    // Sorteia 3 caracteres usando entropia criptográfica CSPRNG
    const randomBytes = crypto.randomBytes(3);
    let code = '';
    for (let i = 0; i < 3; i++) {
        const index = randomBytes[i] % SAFE_CHARSET.length;
        code += SAFE_CHARSET[index];
    }
    const token = `SEC-${category}-${code}`;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
    return {
        token,
        category,
        expiresAt,
        tokenHash,
    };
}
/**
 * Validador de formato de token OTT
 * Verifica se respeita o padrão SEC-[CAT]-[XXX] e não contém 0, O, 1, I
 */
export function validateTokenFormat(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') {
        return { valid: false, normalized: '', error: 'Token nulo ou vazio' };
    }
    const normalized = rawToken.toUpperCase().trim();
    const parts = normalized.split('-');
    // Padrão canônico de 3 partes: SEC-CAT-XXX
    if (parts.length === 3) {
        const [prefix, cat, code] = parts;
        if (prefix !== 'SEC') {
            return { valid: false, normalized, error: 'Prefixo deve ser SEC' };
        }
        if (code.length < 3) {
            return { valid: false, normalized, error: 'Código deve ter no mínimo 3 caracteres' };
        }
        // Verifica ausência de caracteres ambíguos no código
        if (/[01OI]/i.test(code)) {
            return { valid: false, normalized, error: 'Código contém caracteres ambíguos proibidos (0, O, 1, I)' };
        }
        return {
            valid: true,
            category: cat,
            code,
            normalized,
        };
    }
    // Compatibilidade com formato legado SEC-XXX (ex: SEC-942)
    if (parts.length === 2 && parts[0] === 'SEC') {
        return {
            valid: true,
            category: 'SEC',
            code: parts[1],
            normalized,
        };
    }
    return {
        valid: false,
        normalized,
        error: 'Formato inválido. Esperado SEC-[CAT]-[XXX]',
    };
}
//# sourceMappingURL=tokenService.js.map