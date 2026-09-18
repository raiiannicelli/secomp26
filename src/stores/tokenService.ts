/**
 * SECOMP 2026 — Token Service (Lógica Pura de Validação OTT)
 *
 * Módulo puro e isolado de validação de tokens One-Time Token (OTT).
 * Não possui dependências com stores ou DOM — 100% testável de forma unitária.
 */

export interface TokenFormatResult {
  valid: boolean;
  normalized: string;
  category?: string;
  error?: string;
}

export interface TokenValidationResult {
  success: boolean;
  message: string;
  nextStampId?: number;
  updatedUsedTokens?: string[];
}

/**
 * Valida a sintaxe do token de presença.
 * Suporta o formato v3 (ex: SEC-IA-A3K) e o formato legado (ex: SEC-942).
 */
export function validateTokenFormat(rawToken: string): TokenFormatResult {
  if (!rawToken || typeof rawToken !== 'string') {
    return {
      valid: false,
      normalized: '',
      error: 'Token não fornecido ou inválido.',
    };
  }

  const normalized = rawToken.toUpperCase().trim();

  if (!normalized.startsWith('SEC-')) {
    return {
      valid: false,
      normalized,
      error: 'Formato inválido! O token deve iniciar com o prefixo "SEC-".',
    };
  }

  // Formato v3: SEC-[CATEGORIA]-[XXX] (ex: SEC-IA-A3K)
  const v3Match = normalized.match(/^SEC-([A-Z0-9]{2,10})-([A-Z0-9]{3,6})$/);
  if (v3Match) {
    return {
      valid: true,
      normalized,
      category: v3Match[1],
    };
  }

  // Formato legado: SEC-[XXX] (ex: SEC-942)
  const legacyMatch = normalized.match(/^SEC-([A-Z0-9]{3,6})$/);
  if (legacyMatch) {
    return {
      valid: true,
      normalized,
      category: 'GERAL',
    };
  }

  return {
    valid: false,
    normalized,
    error: 'Formato inválido! Esperado: SEC-[CAT]-[XXX] ou SEC-[XXX].',
  };
}

/**
 * Avalia de forma pura a validação do token contra a lista de tokens já utilizados.
 */
export function evaluateTokenValidation(
  rawToken: string,
  usedTokens: string[],
  currentStampIds: number[]
): TokenValidationResult {
  const formatResult = validateTokenFormat(rawToken);

  if (!formatResult.valid) {
    return {
      success: false,
      message: formatResult.error || 'Formato de token inválido.',
    };
  }

  const token = formatResult.normalized;

  if (usedTokens.includes(token)) {
    return {
      success: false,
      message: 'Este token já foi utilizado pelo seu usuário!',
    };
  }

  const nextStampId = currentStampIds.length > 0 ? Math.max(1, ...currentStampIds) + 1 : 1;
  const updatedUsedTokens = [...usedTokens, token];

  return {
    success: true,
    message: `Carimbo ${token} computado com sucesso!`,
    nextStampId,
    updatedUsedTokens,
  };
}
