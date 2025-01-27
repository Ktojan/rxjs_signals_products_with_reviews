import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, filter, map, of, shareReplay, switchMap, tap, mergeMap, BehaviorSubject, combineLatest } from 'rxjs';
import { Product, Result } from './product';
import { HttpErrorService } from '../utilities/http-error.service';
import { Review } from '../reviews/review';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReviewService } from '../reviews/review.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';

  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  private productSelectedSubject = new BehaviorSubject<number | undefined>(
    undefined
  );
  readonly productSelected$ = this.productSelectedSubject.asObservable();

  selectedProductId = signal<number | undefined>(undefined);
  private productsCached: Product[] = [];

  readonly products$ = this.http.get<Product[] | undefined>(this.productsUrl)
    .pipe(
      tap((pr) => {
        console.log('products$', pr);
      }),
      shareReplay(1)
    );

  productSelected(selectedProductId: number): void {
    this.selectedProductId.set(selectedProductId);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productsUrl}/${id}`).pipe(
      // tap(product => console.log('MERGE service get Product ', product)),
      mergeMap((prod) =>
        this.getProdWithReviews(prod).pipe(
          tap((r) =>
            console.log('MERGE service get Product with Reviews', r.productName)
          )
        )
      )
    );
  }

  product$ = combineLatest([this.products$, this.productSelected$]).pipe(
    map(([prArray, id]) => prArray.find((pr) => pr.id === id)),
    filter(Boolean),
    switchMap((prod) => this.getProdWithReviews(prod))
  );

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  hasCache(): boolean {
    return this.productsCached?.length > 0;
  }

  clearCache(): void {
    this.productsCached = [];
  }

  getProductByIdSwitch(id: number): Observable<Result<Product>> {
    const result: Product | undefined = this.productsCached.find(pr => pr.id === id);
    if (result) return of({data: result} as Result<Product>);
    return this.http.get<Product>(`${this.productsUrl}/${id}`).pipe(
      switchMap((prod) =>  this.getProdWithReviews(prod).pipe(
          tap(res => console.log(res)),
          tap({
            next: (pr: Product) => { if (!this.productsCached.some(pr => pr.id === id)) this.productsCached.push(pr)}
          }),
          catchError(err => of(
            {
              data: undefined,
              error: this.errorService.formatError(err),
            } as Result<Product>
          ))    
        )
      ),
      map(prod => ({data: prod} as Result<Product>)),
      tap(res => console.log(res)),
      );
  }

  private getProdWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(
          map((reviews) => ({ ...product, reviews })),
          shareReplay(1),
        );
    }
    return of(product);
  }

  //  EXAMPLE   shell around the array of products for error handling
  productsResult$ = this.http.get<Product[]>(this.productsUrl).pipe(
    map((p) => ({ data: p } as Result<Product[]>)),
    tap((p) => console.log(p)),
    shareReplay(1),
    catchError((err) =>
      of({
        data: [],
        error: this.errorService.formatError(err),
      } as Result<Product[]>)
    )
  );
  private productsResult = toSignal(this.productsResult$, {
    initialValue: { data: [] } as Result<Product[]>,
  });
  products = computed(() => this.productsResult().data);
  productsError = computed(() => this.productsResult().error);

  private productResult1$ = toObservable(this.selectedProductId).pipe(
    filter(Boolean),
    switchMap((id) => {
      const productUrl = this.productsUrl + '/' + id;
      return this.http.get<Product>(productUrl).pipe(
        switchMap((product) => this.getProductWithReviews(product)),
        catchError((err) =>
          of({
            data: undefined,
            error: this.errorService.formatError(err),
          } as Result<Product>)
        )
      );
    }),
    map((p) => ({ data: p } as Result<Product>))
  );

  // Find the product in the existing array of products
  private foundProduct = computed(() => {
    // Dependent signals
    const p = this.products();
    const id = this.selectedProductId();
    if (p && id) {
      return p.find((product) => product.id === id);
    }
    return undefined;
  });

  // Get the related set of reviews
  private productResult$ = toObservable(this.foundProduct).pipe(
    filter(Boolean),
    switchMap((product) => this.getProductWithReviews(product)),
    map((p) => ({ data: p } as Result<Product>)),
    catchError((err) =>
      of({
        data: undefined,
        error: this.errorService.formatError(err),
      } as Result<Product>)
    )
  );

  private getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http
        .get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(map((reviews) => ({ ...product, reviews } as Product)));
    } else {
      return of(product);
    }
  }
}
