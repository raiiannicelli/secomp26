import { describe, it, expect } from 'vitest';
import {
  encryptPII,
  decryptPII,
  generateSHA256,
  generateCertificateHash,
  verifyCertificateHash,
} from '../src/services/cryptoService.js';

describe('CryptoService — Criptografia AES-256-GCM & Hashes Criptográficos', () => {
  describe('Cifragem e Decifragem AES-256-GCM de Dados PII', () => {
    it('deve criptografar e descriptografar corretamente um RA acadêmico', () => {
      const raOriginal = 'a2419876';
      const cipherPayload = encryptPII(raOriginal);

      expect(cipherPayload).toBeDefined();
      expect(cipherPayload).not.toBe(raOriginal);
      // Formato esperado: ivHex:authTagHex:encryptedHex
      const parts = cipherPayload.split(':');
      expect(parts.length).toBe(3);
      expect(parts[0].length).toBe(24); // IV de 12 bytes = 24 hex chars
      expect(parts[1].length).toBe(32); // AuthTag de 16 bytes = 32 hex chars

      const decifrado = decryptPII(cipherPayload);
      expect(decifrado).toBe(raOriginal);
    });

    it('deve criptografar e descriptografar corretamente um número de telefone', () => {
      const phone = '+5541998765432';
      const cipher = encryptPII(phone);
      expect(cipher).not.toBe(phone);

      const decrypted = decryptPII(cipher);
      expect(decrypted).toBe(phone);
    });

    it('deve retornar string vazia ao cifrar ou decifrar valores vazios', () => {
      expect(encryptPII('')).toBe('');
      expect(decryptPII('')).toBe('');
    });

    it('deve gerar payloads criptográficos diferentes para o mesmo texto devido ao IV aleatório', () => {
      const texto = 'RA1234567';
      const cipher1 = encryptPII(texto);
      const cipher2 = encryptPII(texto);

      expect(cipher1).not.toBe(cipher2);
      expect(decryptPII(cipher1)).toBe(texto);
      expect(decryptPII(cipher2)).toBe(texto);
    });

    it('deve lançar erro ao tentar descriptografar payload em formato inválido', () => {
      expect(() => decryptPII('formato_invalido')).toThrow(
        'Payload criptográfico inválido. Formato esperado: iv:tag:ciphertext'
      );
    });

    it('deve falhar a autenticação se o authTag ou ciphertext forem adulterados (Integridade GCM)', () => {
      const cipher = encryptPII('dado_confidencial');
      const parts = cipher.split(':');
      // Adultera o ciphertext mudando o último caractere
      const lastChar = parts[2].slice(-1);
      const tamperedChar = lastChar === 'a' ? 'b' : 'a';
      const tamperedCiphertext = parts[2].slice(0, -1) + tamperedChar;
      const tamperedPayload = `${parts[0]}:${parts[1]}:${tamperedCiphertext}`;

      expect(() => decryptPII(tamperedPayload)).toThrow();
    });
  });

  describe('Indexação Determinística com SHA-256', () => {
    it('deve gerar hashes idênticos para a mesma entrada normalizada (busca O(1))', () => {
      const input = 'a2419876';
      const hash1 = generateSHA256(input);
      const hash2 = generateSHA256(input);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64); // SHA-256 = 64 hex chars
    });

    it('deve gerar hashes distintos para entradas diferentes', () => {
      const hashA = generateSHA256('a2419876');
      const hashB = generateSHA256('a2419877');

      expect(hashA).not.toBe(hashB);
    });

    it('deve suportar salt opcional', () => {
      const hashWithoutSalt = generateSHA256('teste');
      const hashWithSalt = generateSHA256('teste', 'salt-2026');

      expect(hashWithoutSalt).not.toBe(hashWithSalt);
    });
  });

  describe('Assinatura e Verificação de Certificados Digitais com HMAC-SHA256', () => {
    const userId = '11111111-2222-3333-4444-555555555555';
    const ra = 'a2419876';
    const hours = 24;
    const level = 'Mestre da SECOMP';

    it('deve gerar assinatura HMAC-SHA256 determinística para a tupla de negócio', () => {
      const hash1 = generateCertificateHash(userId, ra, hours, level);
      const hash2 = generateCertificateHash(userId, ra, hours, level);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
    });

    it('deve validar com sucesso a autenticidade de um hash de certificado legítimo', () => {
      const validHash = generateCertificateHash(userId, ra, hours, level);
      const isValid = verifyCertificateHash(userId, ra, hours, level, validHash);

      expect(isValid).toBe(true);
    });

    it('deve rejeitar certificado com dados adulterados (ex: horas aumentadas de 24 para 60)', () => {
      const originalHash = generateCertificateHash(userId, ra, hours, level);
      const isTamperedHours = verifyCertificateHash(userId, ra, 60, level, originalHash);

      expect(isTamperedHours).toBe(false);
    });

    it('deve rejeitar certificado caso o nível de maestria seja fraudado', () => {
      const originalHash = generateCertificateHash(userId, ra, 6, 'Aprendiz');
      const isTamperedLevel = verifyCertificateHash(userId, ra, 6, 'Mestre da SECOMP', originalHash);

      expect(isTamperedLevel).toBe(false);
    });
  });
});
