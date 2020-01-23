import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationFormComponent } from './auth/registration-form/registration-form.component';
import { LoginFormComponent } from './auth/login-form/login-form.component';
import { VaultComponent } from './vault/vault.component';
import { B64ConverterComponent } from './tools/b64-converter/b64-converter.component';


const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegistrationFormComponent },
  { path: 'login', component: LoginFormComponent },
  { path: 'vault', component: VaultComponent },
  { path: 'tools/b64-convert', component: B64ConverterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
