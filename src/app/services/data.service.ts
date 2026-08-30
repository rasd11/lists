import { inject, Injectable } from "@angular/core";
import type { List } from "./models/data.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private http = inject(HttpClient);

    getAvailableLists(): string[] {
        return [];
    }

    getListData(listName: string): Observable<List> {
        return this.http.get<List>(`assets/data/${listName}.json`);
    }

    modifyListData(listName: string, newData: List): void {
        throw new Error("Method not implemented.");
    }

    deleteList(listName: string): void {
        throw new Error("Method not implemented.");
    }

    createList(listName: string, initialData: List): void {
        throw new Error("Method not implemented.");
    }

}