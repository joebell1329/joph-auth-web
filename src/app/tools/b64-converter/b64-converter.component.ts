import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { fromByteArray, toByteArray } from 'base64-js';

@Component({
  selector: 'ja-b64-converter',
  templateUrl: './b64-converter.component.html',
  styleUrls: ['./b64-converter.component.scss']
})
export class B64ConverterComponent implements OnInit {

  public formKeys = {
    ascii: 'ascii',
    b64: 'b64'
  }

  public base64Form: FormGroup;
  public ascii: FormControl;
  public b64: FormControl;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.base64Form = this.formBuilder.group({
      [this.formKeys.ascii]: [''],
      [this.formKeys.b64]: ['']
    });
    this.ascii = this.base64Form.get(this.formKeys.ascii) as FormControl;
    this.b64 = this.base64Form.get(this.formKeys.b64) as FormControl;
  }

  public asciiToB64() {
    const encoder = new TextEncoder();
    const byteArray = encoder.encode(this.ascii.value);
    return fromByteArray(byteArray);
  }

  b64ToAscii() {
    const decoder = new TextDecoder();
    const byteArray = toByteArray(this.b64.value);
    return decoder.decode(byteArray);
  }

}
