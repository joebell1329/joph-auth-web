import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { VaultService } from 'src/app/api/vault.service';
import { VaultManagementService } from 'src/app/vault/vault-management.service';
import { IVault } from 'src/app/vault/vault.model';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'ja-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss']
})
export class RegistrationFormComponent implements OnInit {

  public formKeys = {
    email: 'email',
    password: 'password'
  }

  public registrationForm: FormGroup;
  public email: FormControl;
  public password: FormControl;

  constructor(private formBuilder: FormBuilder, private vaultService: VaultService, private vaultManagementService: VaultManagementService) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.registrationForm = this.formBuilder.group({
      [this.formKeys.email]: ['', Validators.email],
      [this.formKeys.password]: ['', Validators.required]
    });

    this.email = this.registrationForm.get(this.formKeys.email) as FormControl;
    this.password = this.registrationForm.get(this.formKeys.password) as FormControl;
  }

  onSubmit(): void {
    const vault: IVault = [];
    this.vaultManagementService.lockVault(vault, this.password.value)
      .pipe(
        switchMap(lockedVault => this.vaultService.createVault(this.email.value, lockedVault))
      )
      .subscribe(response => console.log(response));
  }

}
