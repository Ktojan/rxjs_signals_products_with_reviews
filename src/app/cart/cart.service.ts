import { Injectable, computed, effect, signal } from "@angular/core";
import { CartItem } from "./cart";
import { Product } from "../products/product";

const initialItems = [ //todo delete
    {
        "product": {
            "id": 5,
            "productName": "Hammer",
            "productCode": "TBX-0048",
            "description": "Curved claw steel hammer",
            "price": 8.9,
            "quantityInStock": 8,
            "hasReviews": true,
            "reviews": [
                {
                    "id": 2,
                    "productId": 5,
                    "userName": "thor364",
                    "title": "Didn't work as I expected",
                    "text": "I summon this hammer, and it does not heed my call"
                },
                {
                    "id": 3,
                    "productId": 5,
                    "userName": "allthumbs",
                    "title": "Dangerous!",
                    "text": "I almost injured myself with this product"
                },
                {
                    "id": 5,
                    "productId": 5,
                    "userName": "theoden",
                    "title": "Now for wrath. Now for ruin",
                    "text": "This hammer (and a dinner bell) worked even better than a horn for drawing attention"
                },
                {
                    "id": 6,
                    "productId": 5,
                    "userName": "glamdring",
                    "title": "This was no foe-hammer",
                    "text": "Product was much smaller than expected"
                }
            ]
        },
        "quantity": 2
    },
    {
        "product": {
            "id": 2,
            "productName": "Set of clamps",
            "productCode": "GDN-0023",
            "description": "15 gallon capacity rolling garden cart",
            "price": 32.99,
            "quantityInStock": 2,
            "hasReviews": true,
            "reviews": [
                {
                    "id": 4,
                    "productId": 2,
                    "userName": "mom42",
                    "title": "Great for the kiddos",
                    "text": "My kids love to play with this cart"
                }
            ]
        },
        "quantity": 1
    },
    {
        "product": {
            "id": 10,
            "productName": "Sanding Machine",
            "productCode": "GMG-0042",
            "description": "Standard two-button video game controller",
            "price": 35.95,
            "quantityInStock": 12,
            "hasReviews": true,
            "reviews": [
                {
                    "id": 1,
                    "productId": 10,
                    "userName": "jackharkness",
                    "title": "Works great",
                    "text": "I've beat every level faster with this controller"
                },
                {
                    "id": 7,
                    "productId": 10,
                    "userName": "grima",
                    "title": "Nothing but a herald of woe",
                    "text": "I played no better with this controller than my old one"
                }
            ]
        },
        "quantity": 6
    }
]

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Manage state with signals
  cartItems = signal<CartItem[]>(initialItems);

  // Number of items in the cart
  cartCount = computed(() => this.cartItems()
    .reduce((accQty, item) => accQty + item.quantity, 0)
  );

  subTotal = computed(() => this.cartItems().reduce((accTotal, item) =>
    accTotal + (item.quantity * item.product.price), 0));

  deliveryFee = computed<number>(() => this.subTotal() < 300 ? 5.99 : 0);

  tax = computed(() => this.subTotal() * 0.1) ;

  totalPrice = computed(() => this.subTotal() + this.deliveryFee() + this.tax());

  eLength = effect(() => console.log('Cart array length', this.cartItems().length));

  addToCart(product: Product): void {
    const index = this.cartItems().findIndex(item =>
      item.product.id === product.id);
    if (index === -1) {
      this.cartItems.update(items => [...items, { product, quantity: 1 }]);
    } else {
      this.cartItems.update(items =>
        [
          ...items.slice(0, index),
          { ...items[index], quantity: items[index].quantity + 1 },
          ...items.slice(index + 1)
        ]);
    }
  }

  removeFromCart(cartItem: CartItem): void {
    this.cartItems.update(items => 
      items.filter(item => item.product.id !== cartItem.product.id));
  }

  updateQuantity(cartItem: CartItem, quantity: number): void {
    this.cartItems.update(cart => cart.map(
      item => item.product.id === cartItem.product.id ?
        {... item, quantity} : item
    ))
  }
}
