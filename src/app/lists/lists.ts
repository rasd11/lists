import { Component, computed, effect, inject, input, linkedSignal, OnInit } from '@angular/core';
import { CdkDropList, CdkDrag, CdkDragDrop, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';
import { signal } from '@angular/core';
import { List, ListItem, ListSection } from '../services/models/data.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Editor } from "./editor/editor";
import { Dialog } from "../shared/dialog/dialog";
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Navigator } from "../shared/navigator/navigator";
import { DatabaseService } from '../services/database.service';
import { DataService } from '../services/data.service';
import { computeGitBlobSha } from '../shared/shared.utils';
import { RouterLinkActive } from "@angular/router";
import { Sidebar } from "./sidebar/sidebar";
import { Header } from "./header/header";
interface Row {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}
@Component({
  selector: 'app-lists',
  imports: [MatTableModule, MatButtonModule, MatIconModule, Editor, Dialog, MatFormFieldModule, MatInputModule, MatSelectModule, CdkDropList, CdkDrag, CdkDragHandle, Header],
  templateUrl: './lists.html',
  styleUrl: './lists.css',
})
export class Lists {


  dataService = inject(DataService);
  mode = signal<'EDIT' | 'CREATE'>('EDIT');
  editSection = signal<ListSection | null>(null);
  editItem = signal<ListItem | null>(null);
  openEditorDialog = signal(false);
  delete = signal<{ sectionId: string; itemId: number, title: string } | null>(null);
  selectedSectionId = this.dataService.selectedSectionId;

  pages = computed(() => this.dataService.pages());
  data = this.dataService.data;

  selectedSection = signal<ListSection | null>(null);

  columns = computed(() => ['position', ...this?.data()?.sections?.[0]?.itemDefinition.map(item => item.name) ?? [], 'actions']);

  constructor() {

    effect(() => {
      if (this.selectedSectionId() && this?.data()?.sections) {
        const sections = this?.data()?.sections;
        this.selectedSection.set(sections?.find(section => section.id === this.selectedSectionId()) || null);
      }
    });

    // effect(() => {
    //   if (this.dataService.data()) {
    //     this.data.set(this.dataService.data()!);
    //   }
    // });

    // this.dataService.data().subscribe(data => {
    //   this.setData(data);
    // });
    // this.databaseService.getDataForObject('test.json').then(async (snapshot) => {
    //   console.log(snapshot);
    //   if (!snapshot?.data) {
    //     const sha = await computeGitBlobSha(JSON.stringify(this.data()));
    //     this.databaseService.replaceDataForObject('test.json', { data: this.data(), sha, lastModified: new Date() }).then(() => {
    //       this.databaseService.getDataForObject('test.json').then((snapshot) => {
    //         console.log('Data after replacement:', snapshot);
    //         if (snapshot?.data) {
    //           this.setData(snapshot.data);
    //         }
    //       }).catch((error) => {
    //         console.error('Error retrieving data after replacement:', error);
    //       });
    //     });
    //   } else {
    //     this.setData(snapshot.data);
    //   }

    // }).catch((error) => {
    //   console.error('Error retrieving initial data:', error);
    // });

  }

  // setData(data: List) {
  //   this.data.set({
  //     ...data,
  //   });
  // }


  openEditor(mode: 'EDIT' | 'CREATE', section: ListSection | null = null, item: ListItem | null = null) {
    this.mode.set(mode);
    this.editSection.set(section);
    this.editItem.set(item);
    this.openEditorDialog.set(true);
  }

  onCancel() {
    this.editSection.set(null);
    this.editItem.set(null);
    this.openEditorDialog.set(false);
  }

  onSave(item: Omit<ListItem, 'id'>) {
    console.log('Current mode:', this.mode());
    console.log('Saved item:', item);

    if (this.mode() === 'EDIT') {
      const id = this.editItem()?.id;
      this.dataService.updateRow(this.editSection()?.id || '', id || 0, item).subscribe(
        (response) => {
          console.log('Update successful:', response);
          this.openEditorDialog.set(false);
        },
        (error) => {
          console.error('Update failed:', error);
          this.openEditorDialog.set(false);
        }
      );
      this.openEditorDialog.set(false);
    }
    else if (this.mode() === 'CREATE') {
      this.dataService.addRow(this.editSection()?.id || '', item).subscribe(
        (response) => {
          console.log('Add successful:', response);
          this.openEditorDialog.set(false);
        },
        (error) => {
          console.error('Add failed:', error);
          this.openEditorDialog.set(false);
        }
      );
    }
  }

  onDelete(sectionId: string, itemId: number, title: string) {
    console.log('Deleted item with ID:', itemId, 'from section:', sectionId);
    // Handle the delete logic here, e.g., remove the item from the data
    this.delete.set({ sectionId, itemId, title });
  }

  onDeleteConfirmed() {
    this.dataService.deleteRow(this.delete()?.sectionId || '', this.delete()?.itemId || 0).subscribe(
      (response) => {
        console.log('Delete successful:', response);
        this.delete.set(null);

      },
      (error) => {
        console.error('Delete failed:', error);
        this.delete.set(null);

      }
    );
  }


  drop($event: CdkDragDrop<string, any, any>) {
    this.dataService.moveRow(this.selectedSectionId() || '', $event.previousIndex, $event.currentIndex).subscribe(
      (response) => {
        console.log('Move successful:', response);
      },
      (error) => {
        console.error('Move failed:', error);
      }
    );
  }
}
