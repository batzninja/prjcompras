import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-purchase-request',
  templateUrl: './purchase-request.component.html',
  styleUrls: ['./purchase-request.component.css']
})
export class PurchaseRequestComponent implements OnInit {

  products: any;
  productForm!: FormGroup;
  differentPrice!: boolean;
  priceChanged: number = -1;

  constructor(private fb: FormBuilder, public dialog: MatDialog) {
    this.productForm = this.fb.group({
      buyerName: ['',[Validators.required, Validators.pattern('[A-zÀ-ú]*')]],
      cpfCnpj: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(14)]],
      products: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.addProduct();
  }

  submit() {

    this.markAsTouch();

    if (this.productForm.invalid) {
      this.priceChanged = -1;
      return
    }

    this.priceChanged = this.differentPrice ? 1 : 0;
    this.productForm.reset();

  }

  markAsTouch(){
    for (let i = 0; i < this.products.length; i++) {

      let groupProduct = this.products.at(i) as FormGroup;
      let item = groupProduct.get('item');
      let amount = groupProduct.get('amount');
      let price = groupProduct.get('price');

      item?.markAllAsTouched();
      amount?.markAllAsTouched();
      price?.markAllAsTouched();
    }
  }

  priceWasChanged(changed: boolean) {
    this.differentPrice = changed;
  }

  addProduct() {
    this.products = this.productForm.get('products') as FormArray;
    this.products.push(
      this.fb.group({
        item: this.fb.control('', [Validators.required]),
        amount: this.fb.control(1, [Validators.required, Validators.min(1)], ),
        price: this.fb.control(0, [Validators.required,  Validators.min(1)],),
      })
    );

  }

}
