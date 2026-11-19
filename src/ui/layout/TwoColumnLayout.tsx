// TwoColumnLayout.tsx
import React, { useMemo } from 'react';
import Sidebar from './Sidebar';
import { ActionItem } from './LayoutTypes';


export interface TwoColumnLayoutProps {
  items: ActionItem[];
  title: string;
  activeItemId: string;
  isAdmin: boolean;
  onItemSelect: (id: string) => void;
  mobileDropdown?: boolean;
}

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({ items, title, activeItemId, isAdmin, onItemSelect, mobileDropdown }) => {
  // This component is now fully controlled by its parent.
  // The activeId is received as a prop, and changes are emitted via onItemSelect.

  // Filter the items based on the admin flag before rendering
  const visibleItems = useMemo(() => {
    return items.filter(item => !item.adminOnly || isAdmin);
  }, [items, isAdmin]);

  // Use useMemo to find the active component efficiently
  const ActiveDetailComponent = useMemo(() => {
    const activeItem = items.find(item => item.id === activeItemId);
    return activeItem ? activeItem.details : null;
  }, [activeItemId, items]);

  return (
    <div className="app-layout-container">
      {/* LEFT SIDE (15%) */}
      <div className="sidebar-area">
        <Sidebar
          title={title}
          actionItems={visibleItems}
          activeId={activeItemId}
          onSelect={onItemSelect}
          mobileDropdown={mobileDropdown}
        />
      </div>

      {/* RIGHT SIDE (85%) */}
      <div className="detail-area">
        {/* <h2 className="detail-header">{title}</h2> */}
        <div className="detail-content">
          {ActiveDetailComponent ? (
            <ActiveDetailComponent />
          ) : (
            <p>Please select an action item from the left.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnLayout;
