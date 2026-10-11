// types/LayoutTypes.ts

import React from 'react';

// Define the shape of the 'details' component which is the content to be rendered
export type DetailComponent = React.FC<any>; // React Functional Component type

// Defines the structure for each navigation item
export interface ActionItem {
  id: string; // Unique identifier (e.g., 'item-1')
  name: string;
  icon: React.FC<any>; // Icon component (e.g., a simple SVG icon)
  details: DetailComponent; // The component to load when this item is active
  adminOnly?: boolean; // New: Flag to restrict visibility to admins
  section?: string; // Optional: Section header to group items under
}