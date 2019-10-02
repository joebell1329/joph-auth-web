import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IEncryptedData } from '../crypto/crypto.model';

@Injectable({
  providedIn: 'root'
})
export class VaultService {

  constructor(public httpClient: HttpClient) { }

  public getVault(email: string) {
    return this.httpClient.get('http://localhost:8000/vault', { params: { email } });
  }

  public createVault(email: string, payload: IEncryptedData) {
    return this.httpClient.post('http://localhost:8000/vault', { email, payload });
  }

  public updateVault(email: string, payload: IEncryptedData) {
    return this.httpClient.put('http://localhost:8000/vault', { email, payload });
  }

}
