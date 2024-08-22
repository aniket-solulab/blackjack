import { Component } from '@angular/core';
import { apiService } from 'src/app/apiservices';

@Component({
  selector: 'app-transcations',
  templateUrl: './transcations.component.html',
  styleUrls: ['./transcations.component.css']
})

export class TranscationsComponent {
  loading: boolean = false
  showModal = false;
  startIndex = 1;
  itemsPerPage = 10;
  totalpages = 10;
  currentPage: number = 1;

  transactionsLists: TransactionResponse = null;
  closeModal() {
    this.showModal = false;
  }
  getPageNumbers(): number[] {
    return Array.from({ length: this.totalpages }, (_, i) => i + 1);
  }
  goToPage(page: number): void {
    this.currentPage = page;
    this.getTransactionLisst()
    // Implement your page change logic here
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      // Implement your page change logic here
      this.getTransactionLisst()
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalpages) {
      this.currentPage++;
      this.getTransactionLisst()
      // Implement your page change logic here
    }
  }
  async getTransactionLisst() {
    try {
      this.loading = true
      const list = await apiService.get(`/wallet/transactions?startIndex=${this.currentPage}&itemsPerPage=${this.itemsPerPage}`, {}, {
        Authorization: "Bearer " + sessionStorage.getItem("authToken")
      }) as any;
      console.log(list);
      this.totalpages = Math.ceil(list?.data?.totalItems / this.itemsPerPage);
      this.transactionsLists = list?.data as TransactionResponse;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }
  async openModal() {
    this.showModal = true;
    this.getTransactionLisst()
  }

}

type TransactionResponse = {
  "totalItems": number,
  "startIndex": number,
  "itemsPerPage": number,
  items: {
    "_id": string,
    "txnType": "Deposit" | "Withdraw",
    "amount": number
    status: string
    createdAt: Date
  }[]
} | null