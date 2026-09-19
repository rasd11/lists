import { inject, Injectable } from "@angular/core";
import type { List, ObjectSnapshot } from "./models/data.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

type GithubContentEntry = {
    name: string;
    path: string;
    sha: string;
    size: number;
    type: 'file' | 'dir';
};

type GithubFileContent = GithubContentEntry & {
    encoding: 'base64';
    content: string;
};

const OWNER = 'mock-owner';
const REPO = 'mock-repo';
const CONTENTS_URL = `http://localhost:3000/repos/${OWNER}/${REPO}/contents`;

@Injectable({
    providedIn: 'root'
})
export class GithubService {

    private http = inject(HttpClient);

    getAvailableLists(): Observable<GithubContentEntry[]> {
        return this.http.get<GithubContentEntry[]>(CONTENTS_URL).pipe(
            map((entries) => entries
                .filter((entry) => entry.type === 'file' && entry.name.endsWith(''))

            )
        );
    }

    getListData(listName: string): Observable<ObjectSnapshot<List>> {
        return this.http.get<GithubFileContent>(`${CONTENTS_URL}/${listName}`).pipe(
            map((file) => ({
                lastModified: new Date(),
                syncDate: new Date(),
                sha: file.sha,
                name: listName,
                data: JSON.parse(atob(file.content))
            }))
        );
    }

    modifyListData(listName: string, newData: List): Observable<GithubFileContent> {
        const content = btoa(JSON.stringify(newData, null, 2));

        return this.http.get<GithubFileContent>(`${CONTENTS_URL}/${listName}`).pipe(
            switchMap((existing) => this.http.put<{ content: GithubFileContent }>(
                `${CONTENTS_URL}/${listName}`,
                {
                    message: `Update ${listName}`,
                    content,
                    sha: existing.sha,
                }
            )),
            map((response) => response.content)
        );
    }

    deleteList(listName: string): void {
        throw new Error("Method not implemented.");
    }

    createList(listName: string, initialData: List): void {
        throw new Error("Method not implemented.");
    }

}