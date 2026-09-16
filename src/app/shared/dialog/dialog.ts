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
  private dialogRef?: ReturnType<MatDialog['open']>;
  private closingProgrammatically = false;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      if (!this.dialogTemplate) {
        return;
      }
      if (isOpen) {
        this.openDialog();
      } else if (this.dialogRef) {
        this.closingProgrammatically = true;
        this.dialogRef.close();
      }
    });
  }

  ngAfterViewInit(): void {
    this.openDialog();
  }

  openDialog() {
    if (!this.open() || this.dialogRef) {
      return;
    }

    const dialogRef = this.dialog.open(this.dialogTemplate);
    this.dialogRef = dialogRef;

    dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = undefined;
      if (!this.closingProgrammatically) {
        this.cancel.emit();
      }
      this.closingProgrammatically = false;
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
