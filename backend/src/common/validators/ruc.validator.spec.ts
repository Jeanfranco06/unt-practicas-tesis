import { IsRucValidConstraint, validateRuc } from './ruc.validator';

describe('RUC Validator', () => {
  let validator: IsRucValidConstraint;

  beforeEach(() => {
    validator = new IsRucValidConstraint();
  });

  describe('validateRuc utility function', () => {
    it('should validate correct RUC with digit 10', () => {
      // Persona natural con negocio (10): dígito verificador SUNAT módulo 11
      const result = validateRuc('20100070970');
      expect(result.isValid).toBe(true);
    });

    it('should validate correct RUC with digit 20', () => {
      const result = validateRuc('20512345671');
      expect(result.isValid).toBe(true);
    });

    it('should reject RUC with invalid length', () => {
      const result = validateRuc('123456789');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('11 dígitos');
    });

    it('should reject RUC with non-numeric characters', () => {
      const result = validateRuc('2010001230A');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('solo números');
    });

    it('should reject RUC starting with invalid digits', () => {
      const result = validateRuc('99123456789');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('10, 15, 16, 17 o 20');
    });

    it('should reject RUC with invalid check digit', () => {
      const result = validateRuc('20100012308');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('dígito verificador');
    });

    it('should accept RUC starting with 15 (organismos públicos)', () => {
      const result = validateRuc('15012345671');
      expect(result.isValid).toBe(true);
    });

    it('should accept RUC starting with 16 (organismos públicos)', () => {
      const result = validateRuc('16012345678');
      expect(result.isValid).toBe(true);
    });

    it('should accept RUC starting with 17 (organismos públicos)', () => {
      const result = validateRuc('17012345674');
      expect(result.isValid).toBe(true);
    });
  });

  describe('IsRucValidConstraint', () => {
    it('should return true for valid RUC', () => {
      const isValid = validator.validate('20100070970', {} as any);
      expect(isValid).toBe(true);
    });

    it('should return false for invalid RUC', () => {
      const isValid = validator.validate('20100070971', {} as any);
      expect(isValid).toBe(false);
    });

    it('should return false for null value', () => {
      const isValid = validator.validate(null as any, {} as any);
      expect(isValid).toBe(false);
    });

    it('should return false for empty string', () => {
      const isValid = validator.validate('', {} as any);
      expect(isValid).toBe(false);
    });

    it('should provide default error message', () => {
      const message = validator.defaultMessage({} as any);
      expect(message).toContain('dígito verificador');
    });
  });

  // RUCs de prueba válidos según SUNAT
  describe('SUNAT valid RUCs', () => {
    const validRUCs = [
      '20100070970',
      '20512345671',
    ];

    validRUCs.forEach(ruc => {
      it(`should validate ${ruc} as valid`, () => {
        expect(validateRuc(ruc).isValid).toBe(true);
      });
    });
  });
});
