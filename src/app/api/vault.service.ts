import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VaultService {

  constructor(public httpClient: HttpClient) {}

  public getVault(email: string) {
    return this.httpClient.get(`http://localhost:8000/vault`, { params: { email } });
  }

}
