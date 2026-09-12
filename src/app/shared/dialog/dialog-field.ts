import { Directive, ElementRef, inject, input } from '@angular/core';

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

@Directive({
  selector: '[dialogField]',
})
export class DialogField {
  readonly name = input.required<string>({ alias: 'dialogField' });
  private readonly elementRef = inject(ElementRef<FieldElement>);

  get value(): unknown {
    const el = this.elementRef.nativeElement;
    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox') return el.checked;
      if (el.type === 'number') return el.valueAsNumber;
    }
    return el.value;
  }
}
