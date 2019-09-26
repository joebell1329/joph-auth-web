import { Component, OnInit } from '@angular/core';
import { CryptoService } from './crypto/crypto.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'web';

  constructor(public cryptoService: CryptoService) {}

  ngOnInit(): void {
    const data = `this is a
    multi line
    paragraph okepokf oprke poerkge porkh rohjweoirj gowerjhweri ojhwerh
     ewrh
      ewrh e
      r herw
      h ewrh oiejwroihj weroijhoiwerjh oiwerjhio erjh er`;
    const password = 'test123';

    this.cryptoService.encrypt(data, password)
      .subscribe(encryptedData => {
        console.log(encryptedData);
        this.cryptoService.decrypt(encryptedData, password)
          .subscribe(console.log);
      });
  }
}
