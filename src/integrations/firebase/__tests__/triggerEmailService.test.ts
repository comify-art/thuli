import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TriggerEmailService } from '../triggerEmailService';

const addDocMock = vi.fn();
const collectionMock = vi.fn();

vi.mock('firebase/firestore', () => ({
    addDoc: (...args: unknown[]) => addDocMock(...args),
    collection: (...args: unknown[]) => collectionMock(...args),
}));

describe('TriggerEmailService', () => {
    beforeEach(() => {
        addDocMock.mockReset();
        collectionMock.mockReset();
        collectionMock.mockReturnValue('mock-collection-ref');
        addDocMock.mockResolvedValue({ id: 'mail-1' });
    });

    it('normalizes single recipient string to an array and writes to mail collection', async () => {
        const fakeDb = {} as any;
        const service = new TriggerEmailService(fakeDb);

        const result = await service.sendEmail({
            to: 'user@example.com',
            message: {
                subject: 'Hello',
                text: 'World',
            },
        });

        expect(collectionMock).toHaveBeenCalledWith(fakeDb, 'mail');
        expect(addDocMock).toHaveBeenCalledWith('mock-collection-ref', {
            to: ['user@example.com'],
            message: { subject: 'Hello', text: 'World' },
        });
        expect(result).toEqual({ id: 'mail-1' });
    });

    it('supports custom collection name and optional fields', async () => {
        const fakeDb = {} as any;
        const service = new TriggerEmailService(fakeDb, 'outbound_mail');

        await service.sendEmail({
            to: ['a@example.com', 'b@example.com'],
            cc: ['cc@example.com'],
            replyTo: 'reply@example.com',
            message: { subject: 'Subj', html: '<p>Hi</p>' },
        });

        expect(collectionMock).toHaveBeenCalledWith(fakeDb, 'outbound_mail');
        expect(addDocMock).toHaveBeenCalledWith('mock-collection-ref', {
            to: ['a@example.com', 'b@example.com'],
            cc: ['cc@example.com'],
            replyTo: 'reply@example.com',
            message: { subject: 'Subj', html: '<p>Hi</p>' },
        });
    });
});
