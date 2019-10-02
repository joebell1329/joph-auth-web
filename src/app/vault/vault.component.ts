import { Component, OnInit, OnDestroy } from '@angular/core';
import { VaultManagementService } from './vault-management.service';
import { Observable, interval, Subject } from 'rxjs';
import { IVaultTokens } from './vault.model';
import { takeUntil, switchMap, take, map } from 'rxjs/operators';

@Component({
  selector: 'ja-vault',
  templateUrl: './vault.component.html',
  styleUrls: ['./vault.component.scss']
})
export class VaultComponent implements OnInit, OnDestroy {

  private componentDestroyed$ = new Subject<void>();
  public tokens$: Observable<IVaultTokens>;
  public timeToNext$: Observable<number>;

  constructor(public vaultManagementService: VaultManagementService) { }

  ngOnInit() {
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
}
