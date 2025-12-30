// FIX: Import React to resolve errors with missing 'React' and 'JSX' namespaces.
import React from 'react';

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  description: string;
  ageRange: string;
  period: '1st' | '2nd' | '3rd';
  // FIX: Changed JSX.Element to React.JSX.Element for explicit type resolution.
  icon: (props: React.ComponentProps<'svg'>) => React.JSX.Element;
}

export type Role = 'user' | 'admin';