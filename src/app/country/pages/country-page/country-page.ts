import { JsonPipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountryService } from '../../services/country.service';
import { Country } from '../../interfaces/country.interface';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-country-page',
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './country-page.html',
})
export class CountryPage {
  fb = inject(FormBuilder)
  countryService = inject(CountryService)

  regions = signal(this.countryService.regions)

  countryByRegion = signal<Country[]>([])
  borders = signal<Country[]>([])

  myForm = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  })

  // Es necesario limpiar la suscripcion para que al volver y reconstruir el componente
  onFormChanged = effect((onCleanup) => {
    const regionSuscription = this.onRegionChanged();
    const countrySuscription = this.onCountryChanged();

    onCleanup(() => {
      regionSuscription.unsubscribe();
      countrySuscription.unsubscribe();
    })
  })

  onRegionChanged() {
    return this.myForm.get('region')!.valueChanges
      .pipe(
        tap(() => this.myForm.get('country')!.setValue('')),
        tap(() => this.myForm.get('border')!.setValue('')),
        tap(() => {
          this.borders.set([]);
          this.countryByRegion.set([])
        }),
        switchMap(region => this.countryService.getCountriesByRegion(region!))
      )
      .subscribe(countries => {
        this.countryByRegion.set(countries);
      })
  }

  onCountryChanged() {
    return this.myForm.get('country')!.valueChanges
      .pipe(
        tap(() => this.myForm.get('border')!.setValue('')),
        filter(value => value!.length > 0),
        tap(() => {
          this.borders.set([]);
        }),
        switchMap(alphaCode => this.countryService.getCountryByAlphaCode(alphaCode ?? '')),
        switchMap(country => this.countryService.getCountryNamesCodeArray(country.borders))
      )
      .subscribe(borders => {
        this.borders.set(borders)
      })
  }
}
