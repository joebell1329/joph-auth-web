import { IEncryptedData } from '../crypto/crypto.model';

export interface IVaultItem {
  name: string;
  secret: string;
}

export interface IVaultToken {
  name: string;
  token: string;
}

export type IVault = IVaultItem[];

export type IVaultTokens = IVaultToken[];

export interface ILockedVault {
  id: string;
  email: string;
  data: IEncryptedData;
}
