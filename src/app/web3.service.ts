import { Injectable } from "@angular/core";
import { contractabi } from "src/environments/contractabi";
import Web3 from 'web3';
import { apiService } from "./apiservices";
import { GameService } from "./game.service";

@Injectable({
    providedIn: 'root'
})
export class Web3Service {
    public web3: any;
    public withdrawBalance: number = 0;
    public contract: any;
    public account: string = '';
    private isWalletConnected: boolean = false;
    public balance: any;

    constructor(public game: GameService) {
        this.initializeWeb3();
    }

    async initializeWeb3() {
        try {
            // @ts-ignore
            if (typeof window.ethereum !== 'undefined') {
                // @ts-ignore
                let accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    // @ts-ignore
                    this.web3 = new Web3(window.ethereum);
                    this.account = accounts[0];

                    this.contract = new this.web3.eth.Contract(contractabi, '0xA7D9D6c5424e401ec02e3f724AC7C5a9942bdbcA');
                    this.isWalletConnected = true;
                    this.balance = await this.getBalance()
                } else {
                    await this.connectWallet();
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    async getUserWithDrawBalance() {
        try {
            const iswithdraw = await this.contract._methods.getDepositedAmount(this.account).call()
            if (parseFloat(this.web3.utils.fromWei(iswithdraw, 'ether')) > 0) {
                this.withdrawBalance = parseFloat(parseFloat(this.web3.utils.fromWei(iswithdraw, 'ether'))?.toFixed(3))
                return parseFloat(this.web3.utils.fromWei(iswithdraw, 'ether'))
            }
            return 0
        } catch (error) {
            console.log(error);
            return 0
        }
    }
    async createUserSignup(walletAddress: string) {
        const response = await apiService.post('/auth/sign-up', {
            walletAddress
        }) as any;
        sessionStorage.setItem("authToken", response.data.items.authToken);
        sessionStorage.setItem("userid", response.data.items._user);
        this.game.sessionId = response.data.items._user
        this.game.socket.io.opts.extraHeaders = {
            authorization: `${response.data.items.authToken}`
        };
        this.game.socket.connect();
        this.userbalanceUpdateListner()

    }

    public userbalanceUpdateListner() {
        this.game.socket.on('userBalance', (gameState) => {
            this.withdrawBalance = (gameState?.availableBalance);
        });
    }
    async connectWallet(): Promise<boolean> {
        // @ts-ignore
        if (typeof window.ethereum !== 'undefined') {
            try {
                // @ts-ignore
                let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.account = accounts[0];
                // @ts-ignore
                this.web3 = new Web3(window.ethereum);
                this.contract = new this.web3.eth.Contract(contractabi, '0xFdCEd3cA71C804F831450a1e275d041D66Db8525');
                this.isWalletConnected = true;
                this.balance = await this.getBalance()
                this.getUserWithDrawBalance()
                return true;
            } catch (error) {
                console.error('Failed to connect wallet:', error);
            }
        }
        return false;
    }

    isConnected(): boolean {
        return this.isWalletConnected;
    }

    async getBalance(): Promise<number> {
        if (this.isConnected()) {
            const balance = await this.web3.eth.getBalance(this.account);
            return parseFloat(this.web3.utils.fromWei(balance, 'ether'));
        }
        return 0;
    }

}