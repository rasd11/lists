import { computed, DestroyRef, effect, inject, Injectable, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { List, ObjectSnapshot } from "./models/data.model";
import { DatabaseService } from "./database.service";
import { GithubService } from "./github.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map, Observable, startWith } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DataService {


    destroyRef = inject(DestroyRef);
    databaseService = inject(DatabaseService);
    githubService = inject(GithubService);
    pages = signal<string[]>([]);
    snapshots = signal<ObjectSnapshot<List>[] | null>([]);
    data = computed(() => {
        console.log('Current snapshots:', this.snapshots());
        console.log('Current page:', this.getPage());
        if (!this.getPage() && this.snapshots()?.length && this.snapshots()?.[0]?.name) {
            this.router.navigate(this.snapshots()?.[0] ? [this.snapshots()?.[0].name] : []);

        }

        return this.snapshots()?.find(snapshot => snapshot.name === this.getPage())?.data || this.snapshots()?.[0]?.data
    });

    currentSnapshot = computed(() => this.snapshots()?.find(snapshot => snapshot.name === this.getPage()) || null);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    selectedSectionId = signal<string | null>(null)
    isSynced = computed(() => {
        const snapshot = this.snapshots()?.find(snapshot => snapshot.name === this.getPage());
        if (!snapshot) return false;
        return snapshot.lastModified <= snapshot.syncDate;
    });


    private page = toSignal(this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(null),
        map(() => {
            let route = this.route;
            while (route.firstChild) {
                route = route.firstChild;
            }
            return route.snapshot.paramMap.get('page');
        })
    ), { initialValue: null });

    getPage() {
        return this.page();
    }



    constructor() {

        effect(() => {
            if (this.page()) {
                this.selectedSectionId.set(this.data()?.sections?.[0]?.id || null);
            }
        });

        effect(() => {
            if (!this?.snapshots()?.some(snapshot => snapshot.name === this.getPage()) && this.snapshots()?.[0]?.name) {
                this.router.navigate([this.snapshots()?.[0]?.name]);
            }
        });

        const availableLists$ = this.githubService.getAvailableLists().subscribe(pages => {
            this.pages.set(pages);
            for (const page of pages) {
                console.log('Fetching data for page:', page);
                this.databaseService.getDataForObject(page).subscribe(snapshots => {
                    console.log(snapshots);
                    if (!snapshots?.data) {
                        this.githubService.getListData(page).subscribe(fetchedData => {
                            // debugger;
                            const currentDate = new Date();
                            this.snapshots.update(current => [...(current ?? []), {
                                data: {
                                    ...fetchedData,
                                },
                                sha: "",
                                name: page,
                                lastModified: currentDate,
                                syncDate: currentDate
                            }]);
                        });
                    }
                    else {
                        console.log(snapshots);
                        this.snapshots.update(current => [...(current ?? []), { ...snapshots }]);
                    }
                });
            }
        });

        this.destroyRef.onDestroy(() => {
            availableLists$.unsubscribe();
        });
    }


    updateRow(sectionId: string, itemId: number, newData: any) :Observable<void>{
        const sectionIndex = this.data()?.sections?.findIndex(section => section.id === sectionId);
        if (sectionIndex === undefined || sectionIndex < 0) {
            throw new Error(`Section with ID ${sectionId} not found`);
        }

        const updatedSections = [...(this.data()?.sections ?? [])];
        const items = [...(updatedSections[sectionIndex].items ?? [])];
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex < 0) {
            throw new Error(`Item with ID ${itemId} not found in section ${sectionId}`);
        }

        items[itemIndex] = { ...newData };
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], items };

        const page = this.getPage();
        this.snapshots.update(current =>
            (current ?? []).map(snapshot =>
                snapshot.name === page
                    ? { ...snapshot, data: { ...snapshot.data, sections: updatedSections } }
                    : snapshot
            )
        );
        return this.databaseService.replaceDataForObject(page!, { ...this.currentSnapshot()! });

    }

    moveRow(sectionId: string, previousIndex: number, newIndex: number): Observable<void> {
        const sectionIndex = this.data()?.sections?.findIndex(section => section.id === sectionId);
        if (sectionIndex === undefined || sectionIndex < 0) {
            throw new Error(`Section with ID ${sectionId} not found`);
        }

        const updatedSections = [...(this.data()?.sections ?? [])];
        const items = [...(updatedSections[sectionIndex].items ?? [])];
        const itemIndex = previousIndex;
        if (itemIndex < 0 || newIndex < 0 || newIndex >= items.length) {
            throw new Error(`Invalid move operation for item at index ${itemIndex} to new index ${newIndex}`);
        }

        const [movedItem] = items.splice(itemIndex, 1);
        items.splice(newIndex, 0, movedItem);
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], items };

        const page = this.getPage();
        this.snapshots.update(current =>
            (current ?? []).map(snapshot =>
                snapshot.name === page
                    ? { ...snapshot, data: { ...snapshot.data, sections: updatedSections } }
                    : snapshot
            )
        );
        return this.databaseService.replaceDataForObject(page!, { ...this.currentSnapshot()! });
    }

    addRow(sectionId: string, newData: any): Observable<void> {
        const sectionIndex = this.data()?.sections?.findIndex(section => section.id === sectionId);
        if (sectionIndex === undefined || sectionIndex < 0) {
            throw new Error(`Section with ID ${sectionId} not found`);
        }

        const updatedSections = [...(this.data()?.sections ?? [])];
        const items = [...(updatedSections[sectionIndex].items ?? [])];
        newData.id = items.length > 0 ? Math.max(...items.map(item => +item.id)) + 1 : 1;
        items.push(newData);
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], items };

        const page = this.getPage();
        this.snapshots.update(current =>
            (current ?? []).map(snapshot =>
                snapshot.name === page
                    ? { ...snapshot, data: { ...snapshot.data, sections: updatedSections } }
                    : snapshot
            )
        );
        return this.databaseService.replaceDataForObject(page!, { ...this.currentSnapshot()! });
    }

    deleteRow(sectionId: string, itemId: number) {
        const sectionIndex = this.data()?.sections?.findIndex(section => section.id === sectionId);
        if (sectionIndex === undefined || sectionIndex < 0) {
            throw new Error(`Section with ID ${sectionId} not found`);
        }

        const updatedSections = [...(this.data()?.sections ?? [])];
        const items = [...(updatedSections[sectionIndex].items ?? [])];
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex < 0) {
            throw new Error(`Item with ID ${itemId} not found in section ${sectionId}`);
        }

        items.splice(itemIndex, 1);
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], items };

        const page = this.getPage();
        this.snapshots.update(current =>
            (current ?? []).map(snapshot =>
                snapshot.name === page
                    ? { ...snapshot, data: { ...snapshot.data, sections: updatedSections } }
                    : snapshot
            )
        );
        return this.databaseService.replaceDataForObject(page!, { ...this.currentSnapshot()! });
    }

    addSection(newSection: any): Observable<void> {
        const updatedSections = [...(this.data()?.sections ?? []), newSection];

        const page = this.getPage();
        this.snapshots.update(current =>
            (current ?? []).map(snapshot =>
                snapshot.name === page
                    ? { ...snapshot, data: { ...snapshot.data, sections: updatedSections } }
                    : snapshot
            )
        );
        return this.databaseService.replaceDataForObject(page!, { ...this.currentSnapshot()! });
    }

    deleteSection(sectionId: string): Observable<void> {
        const sectionIndex = this.data()?.sections?.findIndex(section => section.id === sectionId);
        if (sectionIndex === undefined || sectionIndex < 0) {
            throw new Error(`Section with ID ${sectionId} not found`);
        }

        const updatedSections = [...(this.data()?.sections ?? [])];
        updatedSections.splice(sectionIndex, 1);

        const page = this.getPage();
        this.snapshots.update(current =>
            (current ?? []).map(snapshot =>
                snapshot.name === page
                    ? { ...snapshot, data: { ...snapshot.data, sections: updatedSections } }
                    : snapshot
            )
        );
        return this.databaseService.replaceDataForObject(page!, { ...this.currentSnapshot()! });
    }


    syncWithRemote() {
        const current = this.currentSnapshot();
        if (!current) return;
        this.githubService.modifyListData(current.name, current.data);
    }



}