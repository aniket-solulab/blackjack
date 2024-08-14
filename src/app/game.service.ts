import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import gameConfig from 'backend/src/game.config';
import { GameState } from 'backend/src/rooms/schema/GameState';
import * as Colyseus from 'colyseus.js';
import { Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { apiService } from './apiservices';
import { io, Socket } from 'socket.io-client';
import { Web3Service } from './web3.service';
import { NotifierService } from 'angular-notifier';


@Injectable({
  providedIn: 'root',
})
export class GameService {
  public UserProfile: any = null;
  public UserProfileBalance: number = 0;
  public kickEvent = new Subject<void>();
  public roomErrorEvent = new Subject<string>();
  public joinInProgress = false;
  public socket: Socket;
  public connectedBefore = false;
  public sessionId: string
  public roomId: string = ''
  public roomJoined = false
  public gamestate: any = null

  private _room?: Colyseus.Room<GameState>;
  public pingTimeout?: number;
  public client: Colyseus.Client;
  public get room() {
    return this.gamestate;
  }

  public get roundInProgress() {
    return !!this.gamestate && this.gamestate.roundState != 'idle';
  }

  public get roundEndTimestamp() {
    return this.gamestate?.currentTurnTimeoutTimestamp || 0;
  }

  public get player() {
    return this.gamestate?.players[this.sessionId];
  }

  public get playersTurn() {
    return (
      !!this.gamestate &&
      this.gamestate.currentTurnPlayerId == this.sessionId
    );
  }

  constructor(private router: Router, public notifictaion: NotifierService) {
    this.client = new Colyseus.Client(environment.gameServer);
    this.socket = io(environment.gameServer);
    this.setupSocketListeners()
  }

  public async joinRoom(id: string) {
    // try {
    //   const iswithdraw = await this.web3.getUserWithDrawBalance()
    //   if (iswithdraw > 0) {
    //     this.UserProfileBalance = iswithdraw
    //   }
    // } catch (error) {
    //   console.log(error)
    // }
    // finally {
    this.socket.emit("message", { "messageType": "joinRoom", "roomId": id })
    // }
  }
  public async createRoom(walletAddress: string) {
    try {
      this.socket.emit('message', { "messageType": "createRoom", "name": "Blackjack" });
      return true
    } catch (error) {
      console.error('Error creating resource:', error);
      return null;
    }
  }
  /**
   * Given roomId and sessionId tries to reconnect to a room and returns if it was successful
   * @param roomId The roomId
   * @param sessionId The room sessionId
   * @returns True if reconnection was successful, false otherwise
   */
  // public async reconnectRoom(roomId?: string, sessionId?: string) {
  //   if (!roomId) return false;

  //   //Try to reconnect
  //   if (sessionId) {
  //     const connected = await this.updateRoom(() =>
  //       this.client.reconnect(roomId, sessionId)
  //     );

  //     if (connected) return true;
  //   }

  //   //Reconnecting was not successful, try to connect, and return if it was successful
  //   return this.updateRoom(() => this.client.joinById(roomId));
  // }

  /**
   * Tries to reconnect to a room whose data was saved in localStorage and returns if it was successful
   * @returns True if reconnection was successful, false otherwise
   */
  // public async reconnectSavedRoom() {
  //   const roomData = this.loadRoomData();

  //   if (!roomData) return false;

  //   //Try to reconnect
  //   return this.updateRoom(
  //     () => this.client.reconnect(roomData.roomId, roomData.sessionId),
  //     false,
  //     true
  //   );
  // }

  public setReadyState(newState: boolean) {
    // if (this.player?.bet > 0) {
    //   try {
    //   } catch (error) {

    //   }
    // }
    console.log('ready jksssssssssssssssssssssssssssssssssssssssssssssssss', newState);
    this.socket.emit("message", { "messageType": "ready", "data": newState, "roomId": this.roomId })
  }

  public leaveRoom() {
    this.socket?.emit('message', { "messageType": "leaveRoom", "roomId": this.roomId });
    this.socket?.disconnect()
    this.router.navigate(["/"])
    sessionStorage.clear()
  }

  public changeBet(change: number) {
    if (!this.player) return;
    this.socket?.emit("message", { "messageType": "bet", "data": change, "roomId": this.roomId })
  }

  public setBet(newBet: number) {
    if (!newBet) return;
    // this.room?.send('bet', newBet);
    this.socket?.emit("message", { "messageType": "bet", "data": newBet, "roomId": this.roomId })
  }

  public hit() {
    // this.room?.send('hit');
    this.socket?.emit("message", { "messageType": "hit", "roomId": this.roomId })

  }

  public stay() {
    // this.room?.send('stay');
    this.socket?.emit("message", { "messageType": "stay", "roomId": this.roomId })
  }

  // public kick(id: string) {
  //   this.room?.send('kick', id);
  // }

  /**
   * Tries to connect to given room and on success sets up lifecycle hooks
   * @param room The room
   * @param emitErrorEvent If true, on connection error a message is displayed to the user
   * @param deleteRoomDataOnInvalidRoomId If true, on connection error the localStorage room data is deleted
   * @returns If connecting was successful
   */
  // public async updateRoom(
  //   room: () => Promise<Colyseus.Room<GameState>>,
  //   emitErrorEvent = false,
  //   deleteRoomDataOnInvalidRoomId = false
  // ) {
  //   if (this.joinInProgress) return false;
  //   this.joinInProgress = true;

  //   try {
  //     this._room = await room();
  //   } catch (error: any) {
  //     //Was not able to connect

  //     if (emitErrorEvent)
  //       this.roomErrorEvent.next(this.convertRoomErrorToMessage(error));

  //     if (
  //       deleteRoomDataOnInvalidRoomId &&
  //       error?.code === Colyseus.ErrorCode.MATCHMAKE_INVALID_ROOM_ID
  //     )
  //       this.deleteRoomData();

  //     this.joinInProgress = false;
  //     return false;
  //   }

  //   // Connected

  //   this.connectedBefore = true;
  //   this.saveRoomData(this._room);

  //   this._room.onLeave((code) => {
  //     this._room = undefined;
  //     window.clearTimeout(this.pingTimeout);

  //     if (code == gameConfig.kickCode) this.kickEvent.next();

  //     // Player was kicked or they consented left, delete saved data
  //     if (code == gameConfig.kickCode || code == 1000) this.deleteRoomData();

  //     // Abnormal websocket shutdown
  //     if (code == 1006) this.roomErrorEvent.next('Lost connection to server');

  //     this.router.navigate(['/']);
  //   });

  //   // Setup connection lost popup
  //   // this.ping();
  //   // this._room.onMessage('ping', () => this.ping());

  //   this.router.navigate(['/room', this._room.id], {
  //     queryParams: { session: this._room.sessionId },
  //   });

  //   this.joinInProgress = false;
  //   return true;
  // }
  public async updateRoom(
    roomAction: () => Promise<string>,
    emitErrorEvent = false,
    deleteRoomDataOnInvalidRoomId = false
  ) {
    if (this.joinInProgress) return false;
    this.joinInProgress = true;

    try {
      const roomId = await roomAction();
      this.connectedBefore = true;
      this.setupSocketListeners();

      this.router.navigate(['/room', roomId]);

      this.joinInProgress = false;
      return true;
    } catch (error: any) {
      if (emitErrorEvent)
        this.roomErrorEvent.next(this.convertRoomErrorToMessage(error));

      if (deleteRoomDataOnInvalidRoomId && error === 'Invalid room ID')
        this.deleteRoomData();

      this.joinInProgress = false;
      return false;
    }
  }
  private setupSocketListeners() {
    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        this.kickEvent.next();
      }
      console.log("here disconnect");

      this.deleteRoomData();
      this.router.navigate(['/']);
    });

    this.socket.on('roomCreated', (gameState) => {
      console.log("room created", gameState);
      this.joinRoom(gameState?.roomId);
      // Update your game state here
    });
    this.socket.on("error", (error) => {
      if (error.message) {
        this.notifictaion.notify('error', error.message)
      }
    })
    this.socket.on('updatedGameState', (updateState) => {

      this.roomJoined = true
      if (!this.gamestate) {
        this.gamestate = updateState;
      }
      if (window.location.pathname.includes("room")) {
        this.gamestate = updateState;
      }
      else {
        console.log("here in update state", updateState, sessionStorage.getItem("roomId"));
        this.router.navigate(['/room', updateState?.roomId], {
          queryParams: { session: "adawd" },
        });
        this.gamestate = updateState;
      }
      this.roomId = updateState?.roomId
      // Update your game state here
      console.log("updatestate from io", updateState);
    });

    // Add more event listeners as needed
  }
  private ping() {
    window.clearTimeout(this.pingTimeout);

    this.pingTimeout = window.setTimeout(() => {
      this.roomErrorEvent.next('No connection to server');
      this.ping();
    }, gameConfig.pingInterval * 2);
  }
  /**
   * Saves room data to localStorage
   */


  /**
   * Loads room data from localStorage
   */
  private loadRoomData() {
    const roomId = localStorage.getItem('roomId');
    const sessionId = localStorage.getItem('sessionId');

    if (!roomId || !sessionId) return null;

    return { roomId: roomId, sessionId: sessionId };
  }

  /**
   * Deletes room data from localStorage
   */
  private deleteRoomData() {
    localStorage.removeItem('roomId');
    localStorage.removeItem('sessionId');
  }

  private convertRoomErrorToMessage(error: any): string {
    if (error instanceof ProgressEvent) return `Can't connect to server`;

    if (error?.code === gameConfig.roomFullCode) return 'Room is full';
    if (error?.code === Colyseus.ErrorCode.MATCHMAKE_INVALID_ROOM_ID)
      return 'Invalid room ID';

    return 'Internal server error';
  }
}
