import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DataService } from './services/data.service';
import { MatButton } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { Lists } from "./lists/lists";
import { List } from './services/models/data.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Lists],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  listData = signal<List | null>(null);
  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    let listData$ = this.dataService.getListData('test').subscribe(data => {
      this.listData.set(data);
    });

    this.destroyRef.onDestroy(() => {
      listData$.unsubscribe();
    });
  }



}
