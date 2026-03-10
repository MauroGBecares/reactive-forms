import { AbstractControl, FormArray, FormGroup, ValidationErrors } from "@angular/forms";
import { email } from "@angular/forms/signals";

async function sleep(){
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, 2500)
  })
}

export class FormUtils {
  // Expresiones Regulares
  static namePattern = '([a-zA-Z]+) ([a-zA-Z]+)';
  static emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  static notOnlySpacesPattern = '^[a-zA-Z0-9]+$';

  static getTextError(errors: ValidationErrors) {
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'minlength':
          return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
        case 'min':
          return `Valor mínimo de ${errors['min'].min}`;
        case 'email':
          return 'El email ingresado no es válido'
        case 'emailTaken':
          return 'El email ya esta siendo usado por otro usuario'
        case 'pattern':
          if (errors['pattern'].requiredPattern === FormUtils.emailPattern) {
            return 'El email no tiene el formato válido'
          }
          return 'Error de patrón contra expresión regular'
        case 'noStrider':
          return 'No puede ser usado ese nombre por las políticas de la empresa'
        default:
          return `Error de validación no controlado ${key}`
      }
    }
    return null;
  }

  static isValidField(form: FormGroup, fieldName: string): boolean | null {
    return (
      !!form.controls[fieldName].errors
      && form.controls[fieldName].touched
    )
  }

  static isFieldOneEqualFieldTwo(field1: string, field2: string) {
    return (formGroup: AbstractControl) => {
      const field1Value = formGroup.get(field1)?.value
      const field2Value = formGroup.get(field2)?.value

      return field1Value === field2Value ? null : { passwordsNotEqual: true }
    }
  }

  static getFieldError(form: FormGroup, fieldName: string): string | null {

    if (!form.controls[fieldName]) return null

    const errors = form.controls[fieldName].errors ?? {}

    return FormUtils.getTextError(errors)
  }

  static isValidFieldInArray(formArray: FormArray, index: number) {
    return (
      formArray.controls[index].errors && formArray.controls[index].touched
    )
  }

  static getFieldErrorInArray(formArray: FormArray, index: number): string | null {

    if (formArray.controls.length === 0) return null

    const errors = formArray.controls[index].errors ?? {}

    return FormUtils.getTextError(errors)
  }

  // Primero valida las validaciones sincronas y luego las asincronas. Si la validaciones sincronas no las pasa, no corre esta funcion
  static async checkingServerResponse(control: AbstractControl) : Promise<ValidationErrors | null> {
    await sleep() // 2 segundos y medio

    const formValue = control.value;

    if(formValue === 'hola@mundo.com'){
      return {
        emailTaken: true
      };
    }
    return null;
  }

  static notStrider(control: AbstractControl) : ValidationErrors | null {
    const formValue = control.value;

    if(formValue === 'strider'){
      return {
        noStrider: true
      }
    }

    return null;
  }
}
