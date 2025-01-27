import {
  Component,
  computed,
  inject,
  Input,
  SimpleChanges,
} from '@angular/core';

import { NgIf, NgFor, CurrencyPipe, AsyncPipe, CommonModule } from '@angular/common';
import { Product, Result } from '../product';
import { ProductData } from '../product-data';
import { ProductService } from '../product.service';
import { CartService } from 'src/app/cart/cart.service';
import { catchError, EMPTY, from, of, Subscription, tap } from 'rxjs';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, CurrencyPipe, CommonModule],
  styles: [`
    .table-responsive {
      border: 1px dashed rgb(33, 37, 41);
      border-radius: 12px;
      margin-top: 2rem;
      font-style: italic;
    }
    `]
})
export class ProductDetailComponent {
  @Input() productId: number;
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private prodArray = ProductData.products;
  private sub: Subscription;

  product: Product;
  // Product to display
  //product = this.productService.product;
  // errorMessage = this.productService.productError;
  errorMessage = '';
  // Set the page title
  pageTitle = computed(() =>
    //this.product()
    this.product
      ? `Product Detail for: ${this.product?.productName}`
      : 'Product Detail'
  );

  // This does not currently prevent the user from
  // ordering more quantity than available in inventory
  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  ngOnChanges(changes: SimpleChanges): void {
    //del
    console.log(changes);
    if (changes['productId']) {
      this.sub = this.productService
        .getProductByIdSwitch(this.productId)
        .pipe(
          tap(res => console.log(res)),
          catchError((res: Result<Product>) => {   //TODO
            this.errorMessage = res.error;
            this.product = res.data;
            return EMPTY;
          })
        )
        .subscribe({
          next: (prodWithR) => {
            this.product = prodWithR.data;
            // this.setCurrentStyles();
          },
          error: (err) => console.error('Some shit in details comp ', err),
        })
    }
  }

  setCurrentStyles() {
    // CSS styles: set per current state of component properties
    return {
      'font-style': this.product.hasReviews ? 'italic' : 'normal',
      'font-weight': this.product.quantityInStock < 10 ? 'bold' : 'normal',
      'font-size': '18px',
    };
  }

  ngOnInit() {
    this.productService.productSelected$.subscribe(res => console.log(res))
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}
