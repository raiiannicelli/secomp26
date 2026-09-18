import crypto from 'crypto';
import { env } from '../config/env.js';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV padrão para AES-GCM
function getKey() {
    return Buffer.from(env.ENCRYPTION_KEY, 'hex');
}
/**
 * Criptografa dados sensíveis de identificação pessoal (PII) com AES-256-GCM.
 * Formato retornado: ivHex:authTagHex:encryptedHex
 */
export function encryptPII(plainText) {
    if (!plainText)
        return '';
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
/**
 * Descriptografa dados sensíveis (PII) cifrados com AES-256-GCM.
 * Valida a integridade via AuthTag antes de liberar o texto claro.
 */
export function decryptPII(cipherPayload) {
    if (!cipherPayload)
        return '';
    const parts = cipherPayload.split(':');
    if (parts.length !== 3) {
        throw new Error('Payload criptográfico inválido. Formato esperado: iv:tag:ciphertext');
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
/**
 * Gera hash SHA-256 determinístico para indexação segura de RAs no banco
 * sem expor o número real em texto claro.
 */
export function generateSHA256(content, salt = '') {
    return crypto.createHash('sha256').update(`${content}:${salt}`).digest('hex');
}
/**
 * Gera a assinatura criptográfica HMAC-SHA256 para auditoria de certificados.
 * Baseado na tupla de negócio: (user_id + ra + hours + level).
 */
export function generateCertificateHash(userId, ra, hours, level) {
    const payload = `${userId}:${ra}:${hours}:${level}`;
    return crypto
        .createHmac('sha256', env.CERTIFICATE_SIGN_SECRET)
        .update(payload)
        .digest('hex');
}
/**
 * Verifica a autenticidade de um certificado contra adulteração de dados.
 */
export function verifyCertificateHash(userId, ra, hours, level, expectedHash) {
    const computed = generateCertificateHash(userId, ra, hours, level);
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(expectedHash, 'hex'));
}
//# sourceMappingURL=cryptoService.js.map