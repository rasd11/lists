import { Component, inject, AfterViewInit, TemplateRef, ViewChild, input, output, contentChildren, effect } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogField } from './dialog-field';

@Component({
  selector: 'app-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './dialog.html',
  styleUrls: ['./dialog.css'],
})
export class Dialog<T> implements AfterViewInit {
  readonly dialog = inject(MatDialog);
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  title = input.required();
  cancel = output<void>();
  save = output<T>();
  initialData = input<T>();
  // inputs projected via ng-content, each marked with [dialogField]="fieldName"
  fields = contentChildren(DialogField, { descendants: true });
  open = input.required<boolean>();
  saveLabel = input<string>();
  cancelLabel = input<string>();

  constructor() {
    effect(() => {
      this.open();
      if (this.dialogTemplate && this.open()) {
        this.openDialog();
      }
    });
  }

  ngAfterViewInit(): void {
    this.openDialog();
  }

  openDialog() {
    if (!this.open()) {
      return;
    }

    const dialogRef = this.dialog.open(this.dialogTemplate);

    dialogRef.afterClosed().subscribe(result => {
      this.cancel.emit();
      console.log(`Dialog result: ${result}`);
    });
  }

  emitCancel() {
    this.cancel.emit();
  }

  emitSave() {
    this.save.emit(this.collectData());
  }

  private collectData(): T {
    const result = { ...(this.initialData() ?? {}) } as Record<string, unknown>;
    for (const field of this.fields()) {
      result[field.name()] = field.value;
    }
    return result as T;
  }

}
