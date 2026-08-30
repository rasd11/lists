import { Component, computed, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { signal } from '@angular/core';
import { List } from '../services/models/data.model';
interface Row {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}
@Component({
  selector: 'app-lists',
  imports: [MatTableModule],
  templateUrl: './lists.html',
  styleUrl: './lists.css',
})
export class Lists {


  rows = signal<Row[]>([
    { id: 1, name: 'Ana Popescu', email: 'ana.popescu@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Mihai Ionescu', email: 'mihai.ionescu@example.com', role: 'Editor', status: 'Active' },
    { id: 3, name: 'Elena Radu', email: 'elena.radu@example.com', role: 'Viewer', status: 'Inactive' },
    { id: 4, name: 'Andrei Dumitrescu', email: 'andrei.d@example.com', role: 'Editor', status: 'Pending' },
    { id: 5, name: 'Ioana Constantin', email: 'ioana.c@example.com', role: 'Admin', status: 'Active' },
  ]);

  data = input.required<List>();

  columns = computed(() => ['id', ...this.data().sections[0].itemDefinition.map(item => item.name)]);
}
