import { Component, OnInit, OnDestroy } from '@angular/core';
import { VaultManagementService } from './vault-management.service';
import { Observable, interval, Subject } from 'rxjs';
import { IVaultTokens, IVault } from './vault.model';
import { takeUntil, switchMap, take, map } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { VaultService } from '../api/vault.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ja-vault',
  templateUrl: './vault.component.html',
  styleUrls: [ './vault.component.scss' ]
})
export class VaultComponent implements OnInit, OnDestroy {

  private componentDestroyed$ = new Subject<void>();
  public tokens$: Observable<IVaultTokens>;
  public timeToNext$: Observable<number>;

  public addTokenForm: FormGroup;
  public tokenName: FormControl;
  public tokenSecret: FormControl;

  public formKeys = {
    tokenName: 'tokenName',
    tokenSecret: 'tokenSecret'
  }

  constructor(private formBuilder: FormBuilder, private router: Router, private vaultManagementService: VaultManagementService, private vaultService: VaultService) { }

  ngOnInit() {
    console.log(this.vaultManagementService.unlockedVault$.value);
    if (!this.vaultManagementService.unlockedVault$.value) {
      this.router.navigate([ '/login' ]);
    }

    this.tokens$ = interval(1000)
      .pipe(
        takeUntil(this.componentDestroyed$),
        switchMap(() => this.vaultManagementService.unlockedVault$),
        switchMap(unlockedVault => this.vaultManagementService.getVaultTokens(unlockedVault))
      );

    this.timeToNext$ = interval(1000)
      .pipe(
        takeUntil(this.componentDestroyed$),
        map(() => {
          const seconds = (new Date()).getSeconds();
          const marker = seconds >= 30 ? 60 : 30;
          return marker - seconds;
        })
      );
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  showAddTokenForm(): void {
    this.addTokenForm = this.formBuilder.group({
      [ this.formKeys.tokenName ]: [ '', Validators.required ],
      [ this.formKeys.tokenSecret ]: [ '', Validators.required ]
    });
    this.tokenName = this.addTokenForm.get(this.formKeys.tokenName) as FormControl;
    this.tokenSecret = this.addTokenForm.get(this.formKeys.tokenSecret) as FormControl;

    this.tokenName.valueChanges.subscribe(console.log);
    this.tokenSecret.valueChanges.subscribe(console.log);
  }

  hideAddTokenForm(): void {
    this.addTokenForm = null;
    this.tokenName = null;
    this.tokenSecret = null;
  }

  onAddTokenFormSubmit(): void {
    this.vaultManagementService.unlockedVault$
      .pipe(
        take(1),
        switchMap(unlockedVault => {
          const updatedVault: IVault = [ { name: this.tokenName.value, secret: this.tokenSecret.value }, ...unlockedVault ]
          return this.vaultManagementService.lockVault(updatedVault, this.vaultManagementService.credentials$.value.password)
        }),
        switchMap(lockedVault => this.vaultService.updateVault(this.vaultManagementService.credentials$.value.email, lockedVault))
      )
      .subscribe();
  }
}
