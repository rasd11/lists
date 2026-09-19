import { Component, effect, inject, input, output, signal } from '@angular/core';
import { DataService } from '../../services/data.service';
import { List, ListSection, ListField, PageEditData } from '../../services/models/data.model';
import { Lists } from '../lists';
import { Dialog } from '../../shared/dialog/dialog';
import { MatFormField, MatLabel, } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatHeaderCellDef, MatCellDef, MatColumnDef, MatHeaderRowDef, MatRowDef } from '@angular/material/table';
import { CdkDropList, CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-page-editor',
  imports: [Dialog, MatFormField, MatLabel, MatInput, FormsModule, MatHeaderCellDef, MatCellDef, MatIcon, MatColumnDef, MatHeaderRowDef, MatRowDef, CdkDropList, CdkDrag, CdkDragHandle, MatTableModule, MatButtonModule, MatIconModule, Dialog],
  templateUrl: './page-editor.html',
  styleUrl: './page-editor.css',
})
export class PageEditor {
  dataService = inject(DataService);
  open = input.required<boolean>();
  cancel = output<void>();
  save = output<PageEditData[]>();
  editLists = signal<PageEditData[]>([]);
  innerOpen = signal(false);
  editId = signal<number | null>(null);
  editSection = signal<ListSection | null>(null);
  editData = signal<PageEditData | null>(null);
  deleteId = signal<number | null>(null);
  deleteTitle = signal<string | null>(null);
  dataModified = signal(false);


  columns = ['name', 'comment', 'actions'];


  private readonly defaultItemDefinition: ListField[] = [
    { name: 'title', type: 'string', comment: 'Name of the game.' },
    { name: 'comment', type: 'string', comment: 'Additional notes about the game.' },
  ];

  constructor() {
    effect(() => {
      if (this.dataService.data()) {
        this.editLists.set(this.dataService.snapshots()?.map((snapshot, index) => ({ metadata: { comment: snapshot.data.metadata.comment ?? '', name: snapshot.data.metadata.name ?? '' }, itemDefinition: snapshot.data.itemDefinition, id: snapshot.data.id })) ?? []);
      }
    });
    effect(() => {
      if (this.editId() !== null) {
        const id = this.editId()!;
        this.editData.set(this.editLists().find(list => list.id === id) ?? null);
      }
    });

  }


  onDialogCancel() {
    this.innerOpen.set(false);
    this.editData.set(null);
    this.editId.set(null);
  }

  onSave() {
    this.dataModified.set(false);
    this.innerOpen.set(false);
    this.save.emit(this.editLists());
    this.editData.set(null);
    this.editId.set(null);
  }

  openDeleteDialog(id: number, title: string) {
    this.deleteId.set(id);
    this.deleteTitle.set(title);
  }

  closeDeleteDialog() {
    this.deleteId.set(null);
    this.deleteTitle.set(null);
  }

  onDeleteConfirm() {
    this.dataModified.set(true);
    const id = this.deleteId();
    if (id !== null) {
      this.editLists.update(lists => lists?.filter(list => list.id !== id) ?? []);
    }
    this.closeDeleteDialog();
  }

  openDialog(id: number | null) {
    this.editId.set(id);
    if (id === null) {
      this.editData.set(null);
    }
    this.innerOpen.set(true);
  }

  onEditFieldChange(field: 'name' | 'comment', value: string) {
    this.editData.update(data => data
      ? { ...data, metadata: { ...data.metadata, [field]: value } }
      : { id: this.editId() ?? this.editLists().length, itemDefinition: this.defaultItemDefinition, metadata: { name: '', comment: '', [field]: value } });
  }

  onDialogSave() {
    this.dataModified.set(true);
    let name = this.editData()?.metadata.name ?? '';
    // if (!name.endsWith('.json')) {
    //   name += '.json';
    // }
    const comment = this.editData()?.metadata.comment ?? '';
    const itemDefinition = this.editData()?.itemDefinition ?? this.defaultItemDefinition;
    const id = this.editId();
    if (id !== null) {
      this.editLists.update(lists => {
        const updatedLists = [...lists];
        const listIndex = updatedLists.findIndex(list => list.id === id);
        if (listIndex !== -1) {
          updatedLists[listIndex] = { ...updatedLists[listIndex], metadata: { name, comment }, itemDefinition, id };
        }
        return updatedLists;
      });
    }
    else {
      this.editLists.update(lists => [...lists, { metadata: { name, comment }, itemDefinition, id: Math.max(-1, ...lists.map(list => list.id)) + 1 }]);
    }
    this.onDialogCancel();
  }

  onCancel() {
    this.cancel.emit();
  }

}
