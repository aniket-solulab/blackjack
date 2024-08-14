import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import gameConfig from 'backend/src/game.config';
import { interval, map, Observable, take } from 'rxjs';
import { GameService } from '../game.service';
import {
  placePlayersAtMobileTable,
  placePlayersAtTable,
} from './placePlayersAtTable';
import { Web3Service } from '../web3.service';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-game-screen',
  templateUrl: './game-screen.component.html',
  styleUrls: ['./game-screen.component.scss'],
})
export class GameScreenComponent {
  location = location;
  Math = Math;
  roomId: string = '';
  userAddress: string = '';
  UserBalance: number = 0;
  smallScreen$: Observable<boolean>;

  constructor(public game: GameService,
    private notifierService: NotifierService
    , public breakpoint: BreakpointObserver, public Wbe3: Web3Service, private cdr: ChangeDetectorRef) {
    this.smallScreen$ = breakpoint
      .observe('(min-width: 640px)')
      .pipe(map((x) => !x.matches));
    this.roomId = this.game.roomId || '';
  }

  /**
   * Returns the relative position (0.5 -> 0 (middle) -> 0.5) of player at table
   */
  async placeBet() {
    try {
      if (this.game.player?.bet > 0) {
        // const estimateGas = await this.Wbe3.web3.eth.estimateGas({ from: this.Wbe3.account, to: "0xEDA8A2E1dfA5B93692D2a9dDF833B6D7DF6D5f93", amount: this.Wbe3.web3.utils.toWei(`${this.game.player.bet}`, "ether") })
        const ts = await this.Wbe3.contract._methods.placeBet(this.Wbe3.web3.utils.toWei(`${this.game.player.bet}`, "ether")).send({
          from: this.Wbe3.account,
          gas: 1000000,
        })
        console.log("ts ts ,", ts)
        this.game.setReadyState(true)
        return
      }
      this.notifierService.notify('error', 'cannot ploace bet on 0 matic! ')
    } catch (error) {
      console.log(error);

    }
  }
  async getGameContractAddress() {
    try {
      // const res = await this.Wbe3.contract.methods.casinoAddress().call();
      console.log(await this.Wbe3.contract?._methods?.casinoAddress()?.call())
      // return 
    } catch (error) {
      console.log(error)
    }
  }
  getPlayerPosition(index: number) {
    return Math.abs(0.5 - (index + 1) / (gameConfig.maxClients + 1));
  }

  getAllPlayers(smallScreen: boolean | null) {
    return (smallScreen ? placePlayersAtMobileTable : placePlayersAtTable)(
      // @ts-ignore
      [...Object.values(this.game.gamestate!.players)],
      this.game.room!.sessionId,
      gameConfig.maxClients
    );
  }


  ngOnInit() {
    this.refreshUserAddress();
  }

  refreshUserAddress() {
    interval(1000).pipe(
      take(3)
    ).subscribe(() => {
      this.cdr.detectChanges()
      this.updateUserAddress();
    });
  }

  updateUserAddress() {
    this.userAddress = this.Wbe3.account;
    this.UserBalance = this.Wbe3.balance?.toFixed(4);
  }

}
