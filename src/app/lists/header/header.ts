import { Component, computed, effect, inject, signal } from '@angular/core';
import { Sidebar } from "../sidebar/sidebar";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatSelect, MatOption } from "@angular/material/select";
import { DataService } from '../../services/data.service';
import { ListSection } from '../../services/models/data.model';

@Component({
  selector: 'app-header',
  imports: [Sidebar, MatFormField, MatLabel, MatSelect, MatOption],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  dataService = inject(DataService);
  data = this.dataService.data;
  selectedSection = signal<ListSection | null>(null);

  selectedSectionId = this.dataService.selectedSectionId;

  constructor() {


    effect(() => {
      if (this?.selectedSectionId()) {
        const sections = this.data()?.sections;
        this.selectedSection.set(sections?.find(section => section.id === this?.selectedSectionId()) || null);
      }
    });
  }


}
