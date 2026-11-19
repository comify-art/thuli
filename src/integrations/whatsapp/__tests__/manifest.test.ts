import { describe, it, expect } from 'vitest';
import {
    getAllPresetWhatsAppGroups,
    getWhatsAppGroupByTier,
    getWhatsAppGroupById,
    resolveWhatsAppGroupName
} from '../manifest';

describe('WhatsApp Groups Manifest', () => {
    it('defines canonical preset groups for all 3 tiers', () => {
        const groups = getAllPresetWhatsAppGroups();
        expect(groups.length).toBe(3);

        const tier1 = getWhatsAppGroupByTier(1);
        expect(tier1?.name).toBe('Network Members');
        expect(tier1?.postingMode).toBe('announcement_only');

        const tier2 = getWhatsAppGroupByTier(2);
        expect(tier2?.name).toBe('Deal Prep');
        expect(tier2?.postingMode).toBe('open_discussion');

        const tier3 = getWhatsAppGroupByTier(3);
        expect(tier3?.namePattern).toBe('Deal-<company-name>');
        expect(tier3?.isDynamic).toBe(true);
    });

    it('resolves group by ID', () => {
        expect(getWhatsAppGroupById('network_members')?.name).toBe('Network Members');
        expect(getWhatsAppGroupById('deal_prep')?.name).toBe('Deal Prep');
        expect(getWhatsAppGroupById('deal_syndicate')?.key).toBe('COMPANY_SYNDICATE');
    });

    it('resolves group names dynamically', () => {
        expect(resolveWhatsAppGroupName(1)).toBe('Network Members');
        expect(resolveWhatsAppGroupName(2)).toBe('Deal Prep');
        expect(resolveWhatsAppGroupName(3, 'Acme Robotics')).toBe('Deal-AcmeRobotics');
        expect(resolveWhatsAppGroupName(3, 'Nova-Dynamics-AI')).toBe('Deal-NovaDynamicsAI');
    });
});
