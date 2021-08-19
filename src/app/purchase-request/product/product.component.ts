import { Output } from '@angular/core';
import { Component, Input, OnInit, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductList } from '../product.module';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  @Input() productFormParent!: FormGroup;
  @Output() priceChange = new EventEmitter<boolean>();

  products: any;
  total: number = 0;
  itensInList: number = 0;
  count: number = 0;
  differentPrice: boolean = false;

  productList: ProductList[] = [
    { name: "Refrigerante (2L)", suggestedPrice: "6.00", selected: false, selectedBy: -1 },
    { name: "Arroz (1kg)", suggestedPrice: "8.00", selected: false, selectedBy: -1 },
    { name: "Geléia (500g)", suggestedPrice: "7.00", selected: false, selectedBy: -1 },
    { name: "Farinha Láctea (500g)", suggestedPrice: "15.00", selected: false, selectedBy: -1 },
    { name: "Água (1,5L)", suggestedPrice: "4.00", selected: false, selectedBy: -1 },
    { name: "Ovo (dúzia)", suggestedPrice: "12.00", selected: false, selectedBy: -1 },
    { name: "Requeijão (200g)", suggestedPrice: "5.00", selected: false, selectedBy: -1 }
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.products = this.productFormParent.get('products') as FormArray;

    this.watchPriceChanges(0);
  }

  addProduct() {
    this.products.push(
      this.fb.group({
        item: this.fb.control('', [Validators.required]),
        amount: this.fb.control(1, [Validators.required, Validators.min(1)],),
        price: this.fb.control(0, [Validators.required, Validators.min(1)]),
      })
    );

    this.count++;

    this.itensInList = this.products.length;
    this.watchPriceChanges(this.count);
  }

  watchPriceChanges(i: number) {
    let groupProduct = this.products.at(i) as FormGroup;
    const price = groupProduct.get('price');

    price?.valueChanges.subscribe(() => {
      this.calculateTotal();
    })
  }

  removeProduct(i: number) {
    this.unselect(i);
    this.products.removeAt(i);
    this.itensInList = this.products.length;
    this.calculateTotal();
  }

  priceWasChanged() {
     for (let index = 0; index < this.products.length; index++) {
       let element = this.products.at(index) as FormGroup;
       let price = element.get('price')?.value;

       if (this.productList[index].suggestedPrice != price) {
         this.differentPrice = true;
         return;
       }
     }

     this.differentPrice = false;
  }

  selectionChange(event: any, i: number) {
    let index = event.value;

    this.productList[index].selected = true;
    this.productList[index].selectedBy = i;

    let maxPrice = parseFloat(this.productList[index].suggestedPrice);

    let groupProduct = this.products.at(i) as FormGroup;
    let selectedItemPrice = groupProduct.get('price');
    selectedItemPrice?.setValidators(Validators.max(maxPrice));
  }

  unselect(i: number) {
    let groupProduct = this.products.at(i) as FormGroup;
    let index = groupProduct.get('item')?.value;

    if (index) {
      this.productList[index].selected = false;
      this.productList[index].selectedBy = -1;
    }
  }

  suggestPrice(i: number) {
    let groupProduct = this.products.at(i) as FormGroup;
    let selectedItemPrice = groupProduct.get('price');
    let index = groupProduct.get('item')?.value;
    selectedItemPrice?.setValue(this.productList[index].suggestedPrice);
  }

  isItemSelected(i: number): boolean {
    let groupProduct = this.products.at(i) as FormGroup;
    let seletedValue = groupProduct.get('item')?.value;

    if (this.productList[seletedValue]?.selected)
      return true;
    else
      return false;

  }

  calculateTotal() {
    this.total = 0;
    for (let index = 0; index < this.products.length; index++) {
      let element = this.products.at(index) as FormGroup;
      let price = element.get('price')?.value;
      let amount = element.get('amount')?.value;
      this.total = this.total + (price * amount);
    }
    this.priceWasChanged();
    this.priceChange.emit(this.differentPrice);
  }

  isControlValid(i: number, control: string): boolean {
    let groupProduct = this.products.at(i) as FormGroup;
    let formcontrol = groupProduct.get(control);

    if (formcontrol?.hasError)
      return false;
    else
      return true;
  }

  returnErrorMsgPrice(i: number, control: string): string{
    let groupProduct = this.products.at(i) as FormGroup;
    let formcontrol = groupProduct.get(control);

    if(formcontrol?.hasError('max'))
      return 'Preço não pode ser maior que o sugerido'
    else if(formcontrol?.hasError('required'))
      return 'Campo obrigário'

    return 'Campo inválido'
  }

  inc(i: number, val: number) {
    let groupProduct = this.products.at(i) as FormGroup;
    let selectedItemAmout = groupProduct.get('amount');
    let newValue = selectedItemAmout?.value + val;

    if (newValue >= 0)
      selectedItemAmout?.setValue(newValue);

    this.calculateTotal();
  }

}
