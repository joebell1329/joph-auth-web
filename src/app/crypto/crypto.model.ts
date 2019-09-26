export interface IEncryptedData {
  /**
   * The encrypted data encoded in base64.
   */
  data: string;

  /**
   * The cryptographic salt encoded in base64.
   */
  salt: string;

  /**
   * The initialization vector encoded in base64.
   */
  iv: string;
}
