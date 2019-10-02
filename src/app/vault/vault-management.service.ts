import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { OtpService } from '../otp/otp.service';
import { CryptoService } from '../crypto/crypto.service';
import { IVault, IVaultTokens } from './vault.model';
import { IEncryptedData } from '../crypto/crypto.model';

@Injectable({
  providedIn: 'root'
})
export class VaultManagementService {

  public unlockedVault$ = new BehaviorSubject<IVault>(null);
  public credentials$ = new BehaviorSubject<{ email: string, password: string }>(null);

  constructor(
    private otpService: OtpService,
    private cryptoService: CryptoService
  ) { }

  public unlockVault(lockedVault: IEncryptedData, password: string): Observable<IVault> {
    return this.cryptoService.decrypt(lockedVault, password)
      .pipe(
        map(unlockedVault => JSON.parse(unlockedVault) as IVault),
        tap(unlockedVault => this.unlockedVault$.next(unlockedVault))
      );
  }

  public lockVault(unlockedVault: IVault, password: string): Observable<IEncryptedData> {
    return this.cryptoService.encrypt(JSON.stringify(unlockedVault), password);
  }

  public getVaultTokens(unlockedVault: IVault): Observable<IVaultTokens> {
    return of(unlockedVault.map(vaultItem => ({
      name: vaultItem.name,
      token: this.otpService.getCode(vaultItem.secret)
    })));
  }

  public setCredentials(email: string, password: string) {
    this.credentials$.next({ email, password });
  }
}
