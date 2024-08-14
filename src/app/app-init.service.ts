import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';

@Injectable({
    providedIn: 'root'
})
export class AppInitService {
    constructor(private web3Service: Web3Service) { }

    async initializeApp() {
        // Perform Web3 and contract connection here
        await this.web3Service.initializeWeb3();
        // You can add more initialization logic here
    }
}
