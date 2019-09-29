import { Component, OnInit } from '@angular/core';
import { combineLatest, interval, Observable, Subject } from 'rxjs';
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
  public password$ = new Subject<string>();

  public password: string;

  constructor(private vaultManagementService: VaultManagementService, private vaultService: VaultService) {
  }

  ngOnInit(): void {
    this.lockedVault$ = this.password$
      .pipe(
        switchMap(() => this.vaultService.getVaultById('5d90ecfd18746f6abc8d7f3f')),
        map(response => ((response as any).payload) as IEncryptedData),
        shareReplay(1)
      );

    this.unlockedVault$ = combineLatest(this.lockedVault$, this.password$)
      .pipe(
        switchMap(([lockedVault, password]) => this.vaultManagementService.unlockVault(lockedVault, password)),
        catchError((err: Error) => {
          alert(err.message);
          return [];
        }),
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
}
