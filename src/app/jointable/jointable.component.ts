import { Component, Input, Output, EventEmitter } from '@angular/core';
import { apiService } from '../apiservices';
import { GameService } from '../game.service';

@Component({
  selector: 'app-jointable',
  templateUrl: './jointable.component.html',
  styleUrls: ['./jointable.component.css']
})
export class JointableComponent {
  constructor(public game: GameService) { }
  showModal = false;
  loading: boolean = false
  tablesLists: any = null
  closeModal() {
    this.showModal = false;
  }
  @Input() btndisabled: boolean = false;
  @Output() createRoom = new EventEmitter<boolean>();
  async openModal() {
    try {
      this.showModal = true;
      this.loading = true;
      const list = await apiService.get('/game-lobby/66b637268ded583f97bf3f21/rooms?startIndex=1&itemsPerPage=10', {}, {
        Authorization: "Bearer " + sessionStorage.getItem("authToken")
      }) as any;
      console.log(list);

      this.tablesLists = list?.data as any;
    } catch (error) {
      console.log(error);
    }
    finally {
      this.loading = false;
    }
  }

}
