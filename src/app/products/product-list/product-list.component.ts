import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { filter, from, fromEvent, map, take, Observable, Subscription, interval, takeWhile, takeUntil, tap, catchError, EMPTY, of, Subject } from 'rxjs';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, NgClass, ProductDetailComponent],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  protected pageTitle = 'Products';

  private productService = inject(ProductService);

  //products = this.productService.products;
  // products$ = this.productService.products$.pipe(
  readonly products$ = this.productService.productsResult$.pipe(
    map(res => res.data),
    catchError(er => {
      this.errorMessage = er;
      return EMPTY;
    })
  ); //delete
  protected errorMessage = this.productService.productsError;
  prd: Product[];
  keySub: Subscription;
  // Selected product id to highlight the entry
  selectedProductId = this.productService.selectedProductId;
  clickTime: number = 700;
  terClick: Subscription;
  hasCached = false;

  onSelected(productId: number): void {
    this.productService.productSelected(productId);
    this.hasCached = this.productService.hasCache();
  }

  clearCache = () => {
    if (this.productService.hasCache()) this.productService.clearCache();
    this.hasCached = false;
  };

  ngOnInit(): void {
    ///////////////////////  EXAMPLE takeUntil, fromEvent, subscription
    // const clicks = fromEvent(document, 'contextmenu').pipe(tap(ev => ev.preventDefault()));
    // this.terClick = interval(650).pipe(
    //   takeUntil(clicks),
    //   tap(i => console.log(i))
    // ).subscribe()
    // this.productService.productsResult$.subscribe(p => this.prd = p.data);
  }

  trackById(index, item: Product): number {
    return item.id;
  }

}
