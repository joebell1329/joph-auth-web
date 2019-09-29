import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VaultService {

  constructor(public httpClient: HttpClient) {}

  public getVaultById(id: string) {
    return this.httpClient.get(`http://localhost:8000/vault/${id}`);
  }
}
