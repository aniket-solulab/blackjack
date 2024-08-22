import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import gameConfig from 'backend/src/game.config';
import { GameService } from '../game.service';
import { Web3Service } from '../web3.service';
import { apiService } from '../apiservices';
import { NotifierService } from 'angular-notifier';
import { from } from 'rxjs';

@Component({
  selector: 'app-join-screen',
  templateUrl: './join-screen.component.html',
  styleUrls: ['./join-screen.component.scss'],
})

export class JoinScreenComponent {
  withdarwLoading: boolean = false;
  walletConnected = false;
  withdrawBalance = 0
  public depositSuccess = false
  public depositloading = false;
  roomId = new FormControl('', [
    Validators.required,
    Validators.minLength(gameConfig.roomIdLength),
    Validators.maxLength(gameConfig.roomIdLength),
  ]);
  joinButtonInvalidTooltip = `Room ID needs to be ${gameConfig.roomIdLength} letters long.`;
  constructor(public game: GameService,
    private notifierService: NotifierService
    , public web3Service: Web3Service) { }
  async connectMetamask() {
    console.log("here");
    this.walletConnected = await this.web3Service.connectWallet();
    this.web3Service.createUserSignup(this.web3Service.account)
  }
  setDepositSuccess(val: boolean) {
    this.depositSuccess = val
  }
  async depositBalance(value: string) {
    if (isNaN(parseInt(value))) {
      return
    }
    if (parseFloat(value) < 0) {
      return this.notifierService.notify('error', 'Minimum deposit amount is 0.1 ETH');
    }
    try {
      this.depositloading = true
      console.log(this.web3Service.contract)
      const reshash = await this.web3Service.contract._methods.deposit(this.web3Service.web3.utils.toWei(`${parseFloat(value)}`, 'ether')).send({
        from: this.web3Service.account,
        gas: 1000000,
        value: this.web3Service.web3.utils.toWei(`${parseFloat(value)}`, 'ether'),
      });
      this.depositloading = false
      this.setDepositSuccess(true)
      console.log(reshash)
    } catch (error) {
      this.depositloading = false
      // @ts-ignore
      console.log(error.code, error.message)
      // @ts-ignore
      if (error.code === 100) { // Error code for user denied transaction
        this.notifierService.notify('error', 'User denied the transaction.');
        // You can also show a user-friendly message in the UI
      } else {
        this.notifierService.notify('error', 'An unexpected error occurred:');
        // Handle other types of errors
      }
    }
  }

  async withDrawBalance() {
    try {
      this.withdarwLoading = true
      // @ts-ignore
      const iswithdraw = await this.web3Service.getUserWithDrawBalance()
      // console.log(parseFloat(this.Wbe3.web3.utils.fromWei(iswithdraw, 'ether')))
      if (iswithdraw > 0) {
        const txhash = await this.web3Service.contract._methods.withdraw(this.web3Service.web3.utils.toWei(`${iswithdraw}`, 'ether')).send({
          from: this.web3Service.account,
          gas: 1000000,
        });
        this.withdarwLoading = false
      } else {
        this.notifierService.notify('error', 'You can withdraw only 90% of your balance.')
        this.withdarwLoading = false
      }
    } catch (error) {
      console.log(error)
      this.withdarwLoading = false
      // @ts-ignore
      if (error.code === 100) { // Error code for user denied transaction
        this.notifierService.notify('error', 'User denied the transaction.');
        // You can also show a user-friendly message in the UI
      } else {
        this.notifierService.notify('error', 'An unexpected error occurred:');
        // Handle other types of errors
      }
    }
  }
  async CreateRoom() {
    try {
      const user = await apiService.get("/me", {},
        {
          Authorization: "Bearer " + sessionStorage.getItem("authToken")
        }
      )
      // @ts-ignore
      this.game.UserProfile = user.data.items;
      const iswithdraw = await this.web3Service.getUserWithDrawBalance()
      if (iswithdraw > 0) {
        // @ts-ignore
        this.game.UserProfileBalance = user?.data?.items?.availableBalance as number;
        // this
      }
      console.log(user)
      // @ts-ignore
      if (iswithdraw < 0.1) {
        return this.notifierService.notify('error', 'Your balance is less than 0.1 ETH. Please add funds to continue.');
      }
      // @ts-ignore
      this.game.UserProfile = user?.data?.items
      await this.game.createRoom(this.web3Service.account);
    } catch (error) {
      console.log(error)
    }
  }
}