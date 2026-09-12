import { Component, input } from '@angular/core';
import { NavigatorModel } from './navigator.model';
import { MatIcon } from "@angular/material/icon";
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatListModule, MatNavList, MatListItem } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navigator',
  imports: [MatIcon, MatButtonModule, MatSelectModule, MatFormFieldModule, MatSidenavModule, MatNavList, MatListItem, RouterLink, RouterLinkActive],
  templateUrl: './navigator.html',
  styleUrl: './navigator.css',
})
export class Navigator {
  links = input.required<NavigatorModel[]>();
}
