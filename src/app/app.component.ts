import { Component, OnInit } from '@angular/core';
import { combineLatest, interval, Observable, of, Subject } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import { IVault, IVaultTokens } from './vault/vault.model';
import { IEncryptedData } from './crypto/crypto.model';
import { VaultManagementService } from './vault/vault-management.service';
import { VaultService } from './api/vault.service';

@Component({
  selector: 'ja-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {

  public lockedVault$: Observable<IEncryptedData>;
  public unlockedVault$: Observable<IVault>;
  public tokens$: Observable<IVaultTokens>;
  public timeToNext$: Observable<number>;
  public vaultAuth$ = new Subject<{ email: string, password: string }>();

  public createEmail: string;
  public createPassword: string;

  public password: string;
  public email: string;

  public newTokenName: string;
  public newTokenSecret: string;

  constructor(private vaultManagementService: VaultManagementService, private vaultService: VaultService) {}

  ngOnInit(): void {
    this.lockedVault$ = this.vaultAuth$
      .pipe(
        switchMap(creds => this.vaultService.getVault(creds.email)),
        map(response => ((response as any).payload) as IEncryptedData),
        shareReplay(1)
      );

    this.unlockedVault$ = combineLatest(this.lockedVault$, this.vaultAuth$)
      .pipe(
        switchMap(([ lockedVault, creds ]) => this.vaultManagementService.unlockVault(lockedVault, creds.password)),
        catchError((err: Error) => {
          alert(err.message);
          return of([]);
        }),
        tap(console.log),
        shareReplay(1)
      );

    this.tokens$ = interval(1000)
      .pipe(
        switchMap(() => this.unlockedVault$),
        switchMap(vault => this.vaultManagementService.getVaultTokens(vault))
      );

    this.timeToNext$ = interval(1000)
      .pipe(map(() => {
        const seconds = (new Date()).getSeconds();
        const marker = seconds >= 30 ? 60 : 30;
        return marker - seconds;
      }));
  }

  createVault() {
    const newVault: IVault = [];
    this.vaultManagementService.lockVault(newVault, this.createPassword)
      .pipe(
        switchMap(newLockedVault => this.vaultService.createVault(this.createEmail, newLockedVault))
      )
      .subscribe(response => {
        console.log(response);
        this.vaultAuth$.next({ email: this.createEmail, password: this.createPassword });
      });
  }

  addToken() {
    this.unlockedVault$
      .pipe(
        take(1),
        map(unlockedVault => {
          return [ ...unlockedVault, {name: this.newTokenName, secret: this.newTokenSecret}];
        }),
        switchMap(unlockedVault => this.vaultManagementService.lockVault(unlockedVault, this.password)),
        switchMap(lockedVault => this.vaultService.updateVault(this.email, lockedVault))
      )
      .subscribe(response => {
        console.log(response);
        this.vaultAuth$.next({ email: this.email, password: this.password });
      });
  }
}
