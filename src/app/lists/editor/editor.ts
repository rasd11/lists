import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { Dialog } from '../../shared/dialog/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ListField, ListItem } from '../../services/models/data.model';

@Component({
  selector: 'app-editor',
  imports: [Dialog, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './editor.html',
  styleUrl: './editor.css',
})
export class Editor {
  mode = input.required<'EDIT' | 'CREATE'>();
  definition = input.required<ListField[] | null>();
  data = input.required<ListItem | null>();
  open = input.required<boolean>();
  cancel = output<void>();
  save = output<Omit<ListItem, 'id'>>();
  inputData = linkedSignal<ListItem | Omit<ListItem, 'id'>>(() => this.data() ?? {});


  updateField(fieldName: string, value: any) {
    this.inputData.update(v => ({ ...v, [fieldName]: value }));
  }

  getFieldValue(fieldName: string): string {
    return (this.inputData()?.[fieldName] as string) ?? '';
  }

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    this.save.emit(this.inputData());
  }

}
