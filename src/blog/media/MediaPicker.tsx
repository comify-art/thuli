import React from 'react';
import { Modal } from '../../ui/Modal';
import { MediaLibrary } from './MediaLibrary';
import { MediaService } from '../../services/mediaService';
import { MediaItem } from '../../types/blog';

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: MediaItem) => void;
    service: MediaService;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
    isOpen,
    onClose,
    onSelect,
    service
}) => {
    const handleSelect = (item: MediaItem) => {
        onSelect(item);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Select Media"
            size="xl"
            actions={
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
                >
                    Cancel
                </button>
            }
        >
            <MediaLibrary
                service={service}
                onSelect={handleSelect}
                selectionMode={true}
            />
        </Modal>
    );
};
