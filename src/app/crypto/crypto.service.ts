import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { fromByteArray, toByteArray } from 'base64-js';

import { IEncryptedData } from './crypto.model';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  /**
   * Encrypts some string data using AES-GCM with a 256 bit key derived with 8000 PBKDF2 iterations.
   * @param data - The data to encrypt.
   * @param password - The plaintext password to derive an encryption key from.
   */
  public encrypt(data: string, password: string): Observable<IEncryptedData> {
    const encoder = new TextEncoder();

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = encoder.encode(data);

    return this.getCryptoKeyForPassword(password)
      .pipe(
        switchMap(cryptoKey => this.deriveKey(cryptoKey, salt)),
        switchMap(derivedKey => this.doEncryption(encodedData, derivedKey, iv)),
        map(buffer => ({
          data: fromByteArray(new Uint8Array(buffer)),
          salt: fromByteArray(salt),
          iv: fromByteArray(iv)
        }))
      );
  }

  /**
   * Decrypts some encrypted data using AES-GCM with a 256 bit key derived with 8000 PBKDF2 iterations.
   * @param data - The encrypted data.
   * @param password - The plaintext password to derive the decryption key from.
   */
  public decrypt(data: IEncryptedData, password: string): Observable<string> {
    const decoder = new TextDecoder();

    return this.getCryptoKeyForPassword(password)
      .pipe(
        switchMap(cryptoKey => this.deriveKey(cryptoKey, toByteArray(data.salt))),
        switchMap(derivedKey => this.doDecryption(data, derivedKey)),
        map(buffer => decoder.decode(new Uint8Array(buffer)))
      );
  }

  /**
   * Converts a plaintext password to a CryptoKey.
   * @param password - The plaintext password to convert.
   */
  private getCryptoKeyForPassword(password: string): Observable<CryptoKey> {
    const encoder = new TextEncoder();
    const encodedPassword = encoder.encode(password);

    return from(crypto.subtle.importKey(
      'raw',
      encodedPassword,
      'PBKDF2',
      false,
      [ 'deriveKey', 'deriveBits' ]
    ));
  }

  /**
   * Derives a 256 bit AES-GCM CryptoKey using PBKDF2 with 8000 iterations.
   * @param cryptoKey - The original key to derive the new key from.
   * @param salt - A randomly generated salt.
   */
  private deriveKey(cryptoKey: CryptoKey, salt: Uint8Array): Observable<CryptoKey> {
    const algo: Pbkdf2Params = {
      name: 'PBKDF2',
      salt,
      iterations: 8000,
      hash: 'SHA-256'
    };

    const derivedParams: AesDerivedKeyParams = {
      name: 'AES-GCM',
      length: 256
    };

    return from(crypto.subtle.deriveKey(
      algo,
      cryptoKey,
      derivedParams,
      false,
      [ 'encrypt', 'decrypt' ]
    ));
  }

  /**
   * Performs an encryption using the AES-GCM algorithm.
   * @param encodedData - UTF-8 encoded data to encrypt.
   * @param derivedKey - The encryption key.
   * @param iv - A randomly generated initialization vector.
   */
  private doEncryption(encodedData: Uint8Array, derivedKey: CryptoKey, iv: Uint8Array): Observable<ArrayBuffer> {
    const params: AesGcmParams = {
      name: 'AES-GCM',
      iv
    };

    return from(crypto.subtle.encrypt(
      params,
      derivedKey,
      encodedData
    ));
  }

  /**
   * Performs a decryption using the AES-GCM algorithm.
   * @param data - The encrypted data.
   * @param derivedKey - The decryption key.
   */
  private doDecryption(data: IEncryptedData, derivedKey: CryptoKey): Observable<ArrayBuffer> {
    const params: AesGcmParams = {
      name: 'AES-GCM',
      iv: toByteArray(data.iv)
    };

    return from(crypto.subtle.decrypt(
      params,
      derivedKey,
      toByteArray(data.data)
    ));
  }
}
