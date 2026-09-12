import { Component, computed, inject } from '@angular/core';
import { Navigator } from "../../shared/navigator/navigator";
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-sidebar',
  imports: [Navigator],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  dataService = inject(DataService);

  pages = computed(() => this.dataService.pages());

}
