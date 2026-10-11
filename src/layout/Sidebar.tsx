// components/Sidebar.tsx
import React from 'react';
import { ActionItem } from './LayoutTypes';


export interface SidebarProps {
  title: string;
  actionItems: ActionItem[];
  activeId: string;
  onSelect: (id: string) => void;
  mobileDropdown?: boolean;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { title, actionItems, activeId, onSelect, mobileDropdown } = props;

  // Group items by section
  const groupedItems = actionItems.reduce((acc, item) => {
    const section = item.section || 'default';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, ActionItem[]>);

  const sections: string[] = [];
  actionItems.forEach(item => {
    const sec = item.section || 'default';
    if (!sections.includes(sec)) {
      sections.push(sec);
    }
  });

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value);
  }

  return (
    <nav className="sidebar-container">
      <h3 className="sidebar-title">{title}</h3>

      {/* Mobile Dropdown (Optional) */}
      {mobileDropdown && (
        <div className="md:hidden mb-4">
          <select
            value={activeId}
            onChange={handleSelectChange}
            className="w-full p-2 border border-border rounded bg-background text-foreground"
          >
            {sections.map(section => (
              <optgroup key={section} label={section === 'default' ? 'Items' : section}>
                {groupedItems[section].map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* Desktop List (Always shown if not mobileDropdown, or hidden on mobile if mobileDropdown is true) */}
      <div className={`action-list ${mobileDropdown ? 'hidden md:block' : ''}`}>
        {sections.map(section => (
          <div key={section} className="sidebar-section">
            {section !== 'default' && (
              <h4 className="sidebar-section-header">{section}</h4>
            )}
            {groupedItems[section].map((item) => {
              const isActive = item.id === activeId;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`action-button ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="icon" />
                  <span className="item-name">{item.name}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;