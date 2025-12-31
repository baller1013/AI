import type { FC, SVGProps } from 'react';

export interface ClassInfo {
    id: string;
    name: string;
    description: string;
    ageRange: string;
    period: '1st' | '2nd' | '3rd';
    icon: FC<SVGProps<SVGSVGElement>>;
    instructor?: string;
}

export interface Child {
    id: string;
    firstName: string;
    lastName: string;
}

export type Role = 'user' | 'admin';
