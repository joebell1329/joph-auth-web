import { Component, OnInit } from '@angular/core';
import { combineLatest, interval, Observable, of, Subject } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

import { IVault, IVaultTokens } from './vault/vault.model';
import { IEncryptedData } from './crypto/crypto.model';
import { VaultManagementService } from './vault/vault-management.service';
import { VaultService } from './api/vault.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {

  public lockedVault$: Observable<IEncryptedData>;
  public unlockedVault$: Observable<IVault>;
  public tokens$: Observable<IVaultTokens>;
  public timeToNext$: Observable<number>;
  public vaultAuth$ = new Subject<{ email: string, password: string }>();

  public password: string;
  public email: string;

  constructor(private vaultManagementService: VaultManagementService, private vaultService: VaultService) {
  }

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
        })
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
}
