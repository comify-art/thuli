import {
    DocumentData,
    Firestore,
    QueryDocumentSnapshot,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    limit as qLimit,
    startAfter,
    QueryConstraint,
    Timestamp
} from 'firebase/firestore';

// Opaque cursor passed between service and UI. Internally it is a Firestore
// `QueryDocumentSnapshot`, but consumers must not inspect it — just pass it
// back into the next page request. Typed as `unknown` so UI code need not
// import Firestore types.
export type PageCursor = unknown;

export interface Page<T> {
    items: T[];
    nextCursor: PageCursor | null;
}

export abstract class BaseAdminService<T extends { id: string }> {
    protected db: Firestore;
    protected collectionName: string;

    constructor(db: Firestore, collectionName: string) {
        this.db = db;
        this.collectionName = collectionName;
    }

    protected get collectionRef() {
        return collection(this.db, this.collectionName);
    }

    async getById(id: string): Promise<T | null> {
        const docRef = doc(this.db, this.collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as T;
        }
        return null;
    }

    async getAll(
        constraints: QueryConstraint[] = []
    ): Promise<T[]> {
        const q = query(this.collectionRef, ...constraints);
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as T);
    }

    /**
     * Cursor-based page fetch. Requests `pageSize + 1` to determine if more
     * pages exist, returns the first `pageSize` items and a `nextCursor`
     * pointing at the last doc of this page (or `null` if this was the final
     * page). Pass `nextCursor` as `cursor` on the next call.
     */
    async getAllPage(
        constraints: QueryConstraint[] = [],
        pageSize: number = 25,
        cursor?: PageCursor | null,
    ): Promise<Page<T>> {
        const paging: QueryConstraint[] = [...constraints, qLimit(pageSize + 1)];
        if (cursor) {
            paging.splice(paging.length - 1, 0, startAfter(cursor as QueryDocumentSnapshot<DocumentData>));
        }
        const q = query(this.collectionRef, ...paging);
        const snap = await getDocs(q);
        const taken = snap.docs.slice(0, pageSize);
        const hasMore = snap.docs.length > pageSize;
        return {
            items: taken.map((d) => d.data() as T),
            nextCursor: hasMore && taken.length > 0 ? (taken[taken.length - 1] as PageCursor) : null,
        };
    }

    async create(data: T): Promise<void> {
        const docRef = doc(this.db, this.collectionName, data.id);
        await setDoc(docRef, {
            ...data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
    }

    async update(id: string, data: Partial<T>): Promise<void> {
        const docRef = doc(this.db, this.collectionName, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now()
        });
    }

    async delete(id: string): Promise<void> {
        const docRef = doc(this.db, this.collectionName, id);
        await deleteDoc(docRef);
    }
}
