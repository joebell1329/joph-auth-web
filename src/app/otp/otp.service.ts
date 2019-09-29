import { Injectable } from '@angular/core';
import { TOTP } from 'otpauth';

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  public getCode(secret: string): string {
    const generator = new TOTP({ secret });
    return generator.generate();
  }
}
