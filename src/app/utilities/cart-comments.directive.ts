import { Directive, ElementRef, Input } from '@angular/core';
import { Review } from '../reviews/review';

@Directive({
     selector: '[cartComments]',
      exportAs: 'cartComments',
       standalone: true,
    providers:[] })
export class CartCommentsDirective {
    constructor(private element: ElementRef) {}
    @Input() set cartComments(comms: Review[]) {
        if (!comms) this.commsElement.textContent = 'no comments';
         else {
            this.commsElement.textContent = comms.reduce((res, val, i) => res += i+1 + ') ' + val.title + '  ', '')
        }
    }
    commsElement = document.createElement('div');

    ngOnInit() {
        this.commsElement.className = 'comment';
        this.element.nativeElement.appendChild(this.commsElement);
        this.element.nativeElement.classList.add('comment-container');
       }

      hide = () => this.commsElement.classList.remove('comment--active');    
      show = () => this.commsElement.classList.add('comment--active');
    
    }
    