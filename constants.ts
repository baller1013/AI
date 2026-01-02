import React from 'react';
import type { ClassInfo } from './types';

export const PaintBrushIcon: ClassInfo['icon'] = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", ...props },
    React.createElement('path', { d: "M13.25 2.022a1.5 1.5 0 0 0-2.5 0l-3.25 4.334a1.5 1.5 0 0 0 .963 2.536h7.074a1.5 1.5 0 0 0 .963-2.536L13.25 2.022ZM3 21.75a.75.75 0 0 0 .75.75h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0-.75.75Z" }),
    React.createElement('path', { fillRule: "evenodd", d: "M12 8.25a.75.75 0 0 0-.75.75v8.25a.75.75 0 0 0 1.5 0V9a.75.75 0 0 0-.75-.75Z", clipRule: "evenodd" })
  )
);

export const MusicNoteIcon: ClassInfo['icon'] = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", ...props },
    React.createElement('path', { d: "M11.25 3.375a.75.75 0 0 0-1.5 0v13.56l-3.22-3.22a.75.75 0 0 0-1.06 1.06l4.5 4.5a.75.75 0 0 0 1.06 0l4.5-4.5a.75.75 0 0 0-1.06-1.06l-3.22 3.22V3.375Z" }),
    React.createElement('path', { d: "M14.25 3.375a.75.75 0 0 0-1.5 0v6.543A4.504 4.504 0 0 0 9 9.75a4.5 4.5 0 0 0-4.5 4.5s.001 0 0 0a4.5 4.5 0 0 0 4.5 4.5s4.5 0 4.5-4.5V3.375Z" })
  )
);

export const BookOpenIcon: ClassInfo['icon'] = (props) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", ...props },
        React.createElement('path', { fillRule: "evenodd", d: "M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9.006 8.254a.75.75 0 0 0-.53 1.28l1.47 1.47-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 1 0 1.06-1.06L12.53 11l1.47-1.47a.75.75 0 1 0-1.06-1.06l-1.47 1.47-1.47-1.47a.75.75 0 0 0-.53-.28Z", clipRule: "evenodd" })
    )
);

export const BeakerIcon: ClassInfo['icon'] = (props) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", ...props },
        React.createElement('path', { fillRule: "evenodd", d: "M3.75 3A.75.75 0 0 0 3 3.75v16.5A.75.75 0 0 0 3.75 21h16.5A.75.75 0 0 0 21 20.25V3.75A.75.75 0 0 0 20.25 3H3.75ZM6.75 7.5A.75.75 0 0 0 6 8.25v7.5a.75.75 0 0 0 .75.75h10.5a.75.75 0 0 0 .75-.75v-7.5A.75.75 0 0 0 17.25 7.5H6.75Z", clipRule: "evenodd" })
    )
);

export const AGE_RANGE_OPTIONS = ["Pre-K", "K-2", "Grades 3-5", "Grades 6-8", "Grades 9-12"];
export const PERIOD_OPTIONS: ClassInfo['period'][] = ["1st", "2nd", "3rd"];
