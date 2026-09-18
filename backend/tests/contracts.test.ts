import { describe, it, expect } from 'vitest';
import {
  RegisterUserSchema,
  LoginUserSchema,
  ValidateAttendanceTokenSchema,
  SharkTankVoteSchema,
  TalentBookingSchema,
  QueryActivitiesSchema,
} from '../src/schemas/contracts.schema.js';

describe('Contracts Schema — Validação Zod v3 de Schemas e Payloads da API', () => {
  describe('RegisterUserSchema', () => {
    it('deve aprovar dados válidos de cadastro de estudante com RA e telefone', () => {
      const valid = {
        email: 'aluno@alunos.utfpr.edu.br',
        password: 'SenhaForte@2026',
        fullName: 'Fulano de Tal',
        ra: 'a2419876',
        phone: '41999998888',
        role: 'STUDENT',
      };

      const result = RegisterUserSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar e-mail em formato inválido', () => {
      const invalid = {
        email: 'email_invalido_sem_arroba',
        password: 'SenhaForte@2026',
        fullName: 'Fulano',
      };

      const result = RegisterUserSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar senhas com menos de 8 caracteres', () => {
      const invalid = {
        email: 'teste@utfpr.edu.br',
        password: '123',
        fullName: 'Teste Nome',
      };

      const result = RegisterUserSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('LoginUserSchema', () => {
    it('deve validar login com email e senha preenchidos', () => {
      const result = LoginUserSchema.safeParse({
        email: 'usuario@utfpr.edu.br',
        password: 'minhasenha',
      });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar senha vazia', () => {
      const result = LoginUserSchema.safeParse({
        email: 'usuario@utfpr.edu.br',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ValidateAttendanceTokenSchema (Anti-Fraude OTT)', () => {
    it('deve aceitar tokens válidos no padrão SEC-XXX', () => {
      expect(ValidateAttendanceTokenSchema.safeParse({ token: 'SEC-942' }).success).toBe(true);
      expect(ValidateAttendanceTokenSchema.safeParse({ token: 'SEC-AB12' }).success).toBe(true);
      expect(ValidateAttendanceTokenSchema.safeParse({ token: 'sec-102' }).success).toBe(true);
    });

    it('deve rejeitar tokens sem o prefixo SEC-', () => {
      expect(ValidateAttendanceTokenSchema.safeParse({ token: 'TOKEN123' }).success).toBe(false);
      expect(ValidateAttendanceTokenSchema.safeParse({ token: '942' }).success).toBe(false);
    });

    it('deve rejeitar tokens muito curtos ou muito longos', () => {
      expect(ValidateAttendanceTokenSchema.safeParse({ token: 'SEC-' }).success).toBe(false);
      expect(ValidateAttendanceTokenSchema.safeParse({ token: 'SEC-12345678999' }).success).toBe(false);
    });
  });

  describe('SharkTankVoteSchema (Anti-Sybil Trava)', () => {
    it('deve aceitar pitchId UUID e clientFingerprint com tamanho seguro', () => {
      const result = SharkTankVoteSchema.safeParse({
        pitchId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        clientFingerprint: 'fingerprint_sha256_hash_device_12345',
      });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar UUID inválido para pitchId', () => {
      const result = SharkTankVoteSchema.safeParse({
        pitchId: 'id-nao-uuid',
        clientFingerprint: 'fingerprint_valida_12345',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('TalentBookingSchema (Speed Interviews)', () => {
    it('deve aprovar agendamento com URL do LinkedIn e área de interesse', () => {
      const result = TalentBookingSchema.safeParse({
        slotId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        linkedinUrl: 'https://www.linkedin.com/in/usuario-exemplo',
        fieldInterest: 'Engenharia de Software & Cloud',
      });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar URLs que não sejam do domínio linkedin.com', () => {
      const result = TalentBookingSchema.safeParse({
        slotId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        linkedinUrl: 'https://meusitepessoal.com/perfil',
        fieldInterest: 'Dev',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('QueryActivitiesSchema (Filtros Multidimensionais da Grade)', () => {
    it('deve aceitar filtros de dia, turno e tema válidos', () => {
      const result = QueryActivitiesSchema.safeParse({
        dayIndex: '1',
        turn: 'MORNING',
        theme: 'TECHNOLOGY',
        isWarmup: 'false',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dayIndex).toBe(1);
        expect(result.data.turn).toBe('MORNING');
        expect(result.data.isWarmup).toBe(false);
      }
    });

    it('deve rejeitar dayIndex fora do intervalo de 1 a 5', () => {
      expect(QueryActivitiesSchema.safeParse({ dayIndex: 0 }).success).toBe(false);
      expect(QueryActivitiesSchema.safeParse({ dayIndex: 6 }).success).toBe(false);
    });
  });
});
