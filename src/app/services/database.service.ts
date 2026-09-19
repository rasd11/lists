import { Injectable } from "@angular/core";
import { List, ObjectSnapshot } from "./models/data.model";
import { forkJoin, from, map, Observable, switchMap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {

    databases: Map<string, IDBDatabase> = new Map<string, IDBDatabase>();

    getDataForObject(objectName: string): Observable<ObjectSnapshot<List>> {
        return new Observable((subscriber) => {
            this.getDatabase(objectName)
                .subscribe({
                    next: (db) => {
                        this.retrieveObject(objectName, db,
                            (value) => {
                                subscriber.next(value);
                                subscriber.complete();
                            },
                            (reason) => {
                                subscriber.error(reason);
                            }
                        );
                    },
                    error: (error) => {
                        subscriber.error(error);
                    }
                });
        });
    }

    private retrieveObject(objectName: string, db: IDBDatabase, resolve: (value: ObjectSnapshot<List>) => void, reject: (reason?: any) => void): void {
        try {
            const transaction = db.transaction(objectName, "readonly");
            const objectStore = transaction.objectStore(objectName);
            const getRequest = objectStore.get(objectName);
            getRequest.onsuccess = (event) => {
                const data = (event.target as IDBRequest).result;
                resolve(data);
            };
            getRequest.onerror = (event) => {
                reject((event.target as IDBRequest).error);
            };
        } catch (error) {
            reject(error);
        }
    };

    private getDatabase(objectName: string): Observable<IDBDatabase> {
        return new Observable((subscriber) => {
            if (this.databases.has(objectName)) {
                subscriber.next(this.databases.get(objectName)!);
                subscriber.complete();
            } else {
                const request = indexedDB.open(objectName);
                request.onupgradeneeded = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    if (!db.objectStoreNames.contains(objectName)) {
                        db.createObjectStore(objectName);
                    }
                };
                request.onsuccess = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    this.databases.set(objectName, db);
                    subscriber.next(db);
                    subscriber.complete();
                };
                request.onerror = (event) => {
                    subscriber.error((event.target as IDBOpenDBRequest).error);
                };
            }
        });
    }

    replaceDataForObject(objectName: string, newData: ObjectSnapshot<List>): Observable<void> {
        return new Observable((subscriber) => {
            this.getDatabase(objectName)
                .subscribe({
                    next: (db) => {
                        const transaction = db.transaction(objectName, "readwrite");
                        const objectStore = transaction.objectStore(objectName);
                        const putRequest = objectStore.put(newData, objectName);
                        newData.syncDate = new Date();
                        putRequest.onsuccess = () => {
                            subscriber.next();
                            subscriber.complete();
                        };
                        putRequest.onerror = (event) => {
                            subscriber.error((event.target as IDBRequest).error);
                        };
                    },
                    error: (error) => {
                        subscriber.error(error);
                    }
                });
        });
    }

    updateDatabases(newDataBases: ObjectSnapshot<List>[]): Observable<void[]> {
        return new Observable((subscriber) => {
            this.databases.clear();
            forkJoin(newDataBases.map(newData => this.replaceDataForObject(newData.name, newData)))
                .subscribe({
                    next: (results) => {
                        subscriber.next(results);
                        subscriber.complete();
                    },
                    error: (error) => {
                        subscriber.error(error);
                    }
                });
        });
    }

    getAllPages(): Observable<ObjectSnapshot<List>[]> {
        return from(indexedDB.databases()).pipe(
            switchMap(databases => forkJoin(databases.map(db => this.getDataForObject(db.name ?? ''))))
        );
    }

}