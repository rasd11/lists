import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { App } from './app';
import { Lists } from './lists/lists';
import { GithubService } from './services/github.service';
import { List } from './services/models/data.model';

// const listResolver: ResolveFn<List> = (route) =>
//     inject(GithubService).getListData(route.paramMap.get('section')!);

export const routes: Routes = [
    { path: '', component: Lists },
    { path: ':page', component: Lists }
];
