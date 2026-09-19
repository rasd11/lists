import { Component, computed, effect, inject, input, linkedSignal, output, signal } from '@angular/core';
import { Dialog } from '../../shared/dialog/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ListSection } from '../../services/models/data.model';
import { MatHeaderCellDef, MatCellDef, MatColumnDef, MatHeaderRowDef, MatRowDef, MatTableModule } from '@angular/material/table';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { Editor } from '../editor/editor';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-section-editor',
  imports: [Dialog, MatFormField, MatLabel, MatInput, FormsModule, MatHeaderCellDef, MatCellDef, MatIcon, MatColumnDef, MatHeaderRowDef, MatRowDef, CdkDropList, CdkDrag, CdkDragHandle, MatTableModule, MatButtonModule, MatIconModule, Dialog],
  templateUrl: './section-editor.html',
  styleUrl: './section-editor.css',
})
export class SectionEditor {

  dataService = inject(DataService);
  open = input.required<boolean>();
  cancel = output<void>();
  save = output<ListSection[] | null>();
  sections = computed(() => this.dataService.data()?.sections || null);
  columns = ['position', 'name', 'actions'];
  editSections = signal<ListSection[] | null>(null);
  innerOpen = signal(false);
  editId = signal<string | null>(null);
  editSection = signal<ListSection | null>(null);
  editName = signal('');
  deleteId = signal<string | null>(null);
  deleteTitle = signal<string | null>(null);
  dataModified = signal(false);


  openDialog(id?: string) {
    this.editId.set(id ?? null);
    this.innerOpen.set(true);
  }



  drop(event: CdkDragDrop<string, any, any>) {

    this.dataModified.set(true);
    this.editSections.update(sections => {
      if (!sections) return sections;
      const copy = [...sections];
      const movedItem = copy.splice(event.previousIndex, 1)[0];
      if (movedItem) {
        copy.splice(event.currentIndex, 0, movedItem);
      }
      return copy;
    });

  }

  constructor() {
    effect(() => {
      this.editSections.set(this.sections());
    });

    effect(() => {
      if (this.editSection()) {
        this.editName.set(this.editSection()!.title);
      }
    });

    effect(() => {
      if (this.editId()) {
        this.editSection.set(this.editSections()?.find(section => section.id === this?.editId()) || null);
      }
    });
  }

  onCancel() {
    this.dataModified.set(false);
    this.cancel.emit();
  }

  onDialogSave() {
    this.innerOpen.set(false);
    this.dataModified.set(true);

    console.log(this.editSections());
    if (!this?.editId()) {
      this.editSections.update(sections => {
        const newSection: ListSection = {
          id: this.editName(),
          title: this.editName(),
          items: []
        };
        return sections ? [...sections, newSection] : [newSection];
      });
    }
    else {
      this.editSections.update(sections => {
        if (this.editSection() && sections) {
          const index = sections.findIndex(section => section.id === this.editSection()!.id);
          if (index !== -1) {
            const copy = [...sections];
            copy[index] = { ...this.editSection()!, title: this.editName() };
            return copy;
          }
        }
        return sections || null;
      });
    }
    console.log(this.editSections());
    this.editId.set(null);
    this.editName.set('');
    this.deleteId.set(null);
    this.deleteTitle.set(null);

  }

  onDialogCancel() {
    this.innerOpen.set(false);
    this.editName.set('');
    this.editId.set(null);
  }

  onSave() {
    this.dataModified.set(false);
    this.innerOpen.set(false);
    this.save.emit(this.editSections());
  }

  openDeleteDialog(id: string, title: string) {
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
    if (id) {
      this.editSections.update(sections => sections ? sections.filter(section => section.id !== id) : null);
    }
    this.closeDeleteDialog();
  }

}
