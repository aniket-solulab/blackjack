import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent {
  showModal = false;
  ethvalue: number = 0.1
  loading: boolean = false
  @Input() depositLoaing: boolean = false
  @Output() depositBalance: any = new EventEmitter<boolean>();
  closeModal() {
    this.ethvalue = 0.1;
    this.showModal = false;
  }
  async openModal() {
    this.showModal = true;
  }
  ngOnDestroy() {
    this.ethvalue = 0.1;
  }
  onKeyDown(event: KeyboardEvent, input: HTMLInputElement) {
    if (event.key === 'Backspace' && parseFloat(input.value) <= 0.1) {
      event.preventDefault();
    }
  }

}
