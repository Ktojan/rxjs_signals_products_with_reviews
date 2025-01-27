import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './utilities/page-not-found.component';

export const routes: Routes = [
  {
    path: 'products',
    loadComponent: () => import('./products/product-list/product-list.component').then(c => c.ProductListComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart-shell/cart-shell.component').then(c => c.CartShellComponent)
  },
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }];
