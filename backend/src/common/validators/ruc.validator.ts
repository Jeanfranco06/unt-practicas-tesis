import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador de dígito verificador para RUC peruano
 * Algoritmica basada en SUNAT
 */
@ValidatorConstraint({ async: false })
export class IsRucValidConstraint implements ValidatorConstraintInterface {
  validate(ruc: string, args: ValidationArguments): boolean {
    if (!ruc || ruc.length !== 11) {
      return false;
    }

    // Validar que solo contenga dígitos
    if (!/^\d{11}$/.test(ruc)) {
      return false;
    }

    // Validar tipo de RUC (debe empezar con: 10, 15, 16, 17, 20)
    const tipoRuc = ruc.substring(0, 2);
    const tiposValidos = ['10', '15', '16', '17', '20'];
    if (!tiposValidos.includes(tipoRuc)) {
      return false;
    }

    // Calcular dígito verificador usando algoritmo de SUNAT
    return this.validarDigitoVerificador(ruc);
  }

  private validarDigitoVerificador(ruc: string): boolean {
    const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    const numeros = ruc.substring(0, 10).split('').map(Number);
    const digitoVerificador = parseInt(ruc.charAt(10), 10);

    let suma = 0;
    for (let i = 0; i < 10; i++) {
      suma += numeros[i] * factores[i];
    }

    const resto = suma % 11;
    // SUNAT: última cifra de (11 - resto); equivale a (11 - resto) % 10 con resto = suma mod 11
    const digitoEsperado = (11 - resto) % 10;

    return digitoEsperado === digitoVerificador;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'El RUC no es válido según el dígito verificador de SUNAT';
  }
}

/**
 * Decorador para validar RUC peruano con dígito verificador
 */
export function IsRucValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRucValidConstraint,
    });
  };
}

/**
 * Función utilitaria para validar RUC sin decorador
 */
export function validateRuc(ruc: string): { isValid: boolean; message?: string } {
  if (!ruc || ruc.length !== 11) {
    return { isValid: false, message: 'El RUC debe tener 11 dígitos' };
  }

  if (!/^\d{11}$/.test(ruc)) {
    return { isValid: false, message: 'El RUC debe contener solo números' };
  }

  const tipoRuc = ruc.substring(0, 2);
  const tiposValidos = ['10', '15', '16', '17', '20'];
  if (!tiposValidos.includes(tipoRuc)) {
    return { isValid: false, message: 'El RUC debe empezar con 10, 15, 16, 17 o 20' };
  }

  const constraint = new IsRucValidConstraint();
  if (!constraint.validate(ruc, {} as ValidationArguments)) {
    return { isValid: false, message: 'El dígito verificador del RUC es inválido' };
  }

  return { isValid: true };
}
