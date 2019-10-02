
import { Component, OnInit } from '@angular/core';
import { VaultService } from 'src/app/api/vault.service';
import { VaultManagementService } from 'src/app/vault/vault-management.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { IVault } from 'src/app/vault/vault.model';
import { switchMap, map } from 'rxjs/operators';
import { IEncryptedData } from 'src/app/crypto/crypto.model';
import { Router } from '@angular/router';

@Component({
  selector: 'ja-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {

  public formKeys = {
    email: 'email',
    password: 'password'
  }

  public loginForm: FormGroup;
  public email: FormControl;
  public password: FormControl;

  constructor(private formBuilder: FormBuilder, private router: Router, private vaultService: VaultService, private vaultManagementService: VaultManagementService) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.loginForm = this.formBuilder.group({
      [this.formKeys.email]: ['', Validators.email],
      [this.formKeys.password]: ['', Validators.required]
    });

    this.email = this.loginForm.get(this.formKeys.email) as FormControl;
    this.password = this.loginForm.get(this.formKeys.password) as FormControl;
  }

  onSubmit(): void {
    this.vaultService.getVault(this.email.value)
      .pipe(
        map(result => (result as any).payload as IEncryptedData),
        switchMap(lockedVault => this.vaultManagementService.unlockVault(lockedVault, this.password.value))
      )
      .subscribe(() => this.router.navigate(['/vault']));
  }

}
