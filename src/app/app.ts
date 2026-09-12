import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { GithubService } from './services/github.service';
import { MatButton } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { Lists } from "./lists/lists";
import { List } from './services/models/data.model';
import { Dialog } from "./shared/dialog/dialog";
import { Editor } from "./lists/editor/editor";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Lists],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App  {
  listData = signal<List | null>(null);
  private githubService = inject(GithubService);
  private destroyRef = inject(DestroyRef);

  // ngOnInit(): void {
  //   let listData$ = this.githubService.getListData('test').subscribe(data => {
  //     this.listData.set(data);
  //   });

  //   this.destroyRef.onDestroy(() => {
  //     listData$.unsubscribe();
  //   });
  // }



}
