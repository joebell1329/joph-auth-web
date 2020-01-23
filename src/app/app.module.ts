import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegistrationFormComponent } from './auth/registration-form/registration-form.component';
import { NavComponent } from './nav/nav.component';
import { LoginFormComponent } from './auth/login-form/login-form.component';
import { VaultComponent } from './vault/vault.component';
import { B64ConverterComponent } from './tools/b64-converter/b64-converter.component';

@NgModule({
  declarations: [
    AppComponent,
    RegistrationFormComponent,
    NavComponent,
    LoginFormComponent,
    VaultComponent,
    B64ConverterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
