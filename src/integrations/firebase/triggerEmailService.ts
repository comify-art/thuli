import { Firestore, DocumentData, DocumentReference, addDoc, collection } from 'firebase/firestore';

export interface TriggerEmailMessage {
    subject: string;
    text?: string;
    html?: string;
}

export interface TriggerEmailPayload {
    to: string | string[];
    message: TriggerEmailMessage;
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
}

/**
 * Lightweight client for the Firebase "Trigger Email from Firestore" extension.
 * Writes email documents into the configured Firestore collection (default: `'mail'`).
 */
export class TriggerEmailService {
    private db: Firestore;
    private collectionName: string;

    constructor(db: Firestore, collectionName = 'mail') {
        this.db = db;
        this.collectionName = collectionName;
    }

    async sendEmail(payload: TriggerEmailPayload): Promise<DocumentReference<DocumentData>> {
        const to = Array.isArray(payload.to) ? payload.to : [payload.to];
        const docPayload: Record<string, unknown> = {
            to,
            message: payload.message,
        };
        if (payload.cc) docPayload.cc = payload.cc;
        if (payload.bcc) docPayload.bcc = payload.bcc;
        if (payload.replyTo) docPayload.replyTo = payload.replyTo;

        return addDoc(collection(this.db, this.collectionName), docPayload);
    }
}
