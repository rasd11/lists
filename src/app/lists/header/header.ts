import { Component, computed, effect, inject, signal } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatSelect, MatOption } from "@angular/material/select";
import { DataService } from '../../services/data.service';
import { ListSection, PageEditData } from '../../services/models/data.model';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { SectionEditor } from '../section-editor/section-editor';
import { PageEditor } from '../page-editor/page-editor';

@Component({
  selector: 'app-header',
  imports: [Sidebar, MatFormField, MatLabel, MatSelect, MatOption, MatIcon, MatButtonModule, MatMenuModule, MatIconModule, SectionEditor, PageEditor],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  dataService = inject(DataService);
  data = this.dataService.data;
  selectedSection = signal<ListSection | null>(null);
  openSectionEditorDialog = signal(false);
  selectedSectionId = this.dataService.selectedSectionId;
  openPageEditorDialog = signal(false);


  constructor() {


    effect(() => {
      if (this?.selectedSectionId()) {
        const sections = this.data()?.sections;
        this.selectedSection.set(sections?.find(section => section.id === this?.selectedSectionId()) || null);
      }
    });
  }


  onSectionSave(listSections: ListSection[]) {
    console.log('Section saved:', listSections);
    this.dataService.updateSections(listSections).subscribe(
      (response) => {
        console.log('Update successful:', response);
        this.openSectionEditorDialog.set(false);
      },
      (error) => {
        console.error('Update failed:', error);
        this.openSectionEditorDialog.set(false);
      }
    );
  }

  onPageSave(pages: PageEditData[]) {
    console.log('Pages saved:', pages);
    this.dataService.updatePages(pages).subscribe(
      (response) => {
        console.log('Update successful:', response);
        this.openPageEditorDialog.set(false);
      },
      (error) => {
        console.error('Update failed:', error);
        this.openPageEditorDialog.set(false);
      }
    );
  }


}
