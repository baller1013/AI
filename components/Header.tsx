import React, { useState } from 'react';
import type { Role } from '../types';

interface HeaderProps {
  role: Role;
  setRole: (role: Role) => void;
}

const ADMIN_CLICK_THRESHOLD = 2;
const CLICK_TIMEOUT_MS = 300;

const Header: React.FC<HeaderProps> = ({ role, setRole }) => {
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [lastClickTimestamp, setLastClickTimestamp] = useState(0);

  const handleTitleClick = () => {
    const now = Date.now();
    let newClickCount;

    if (now - lastClickTimestamp > CLICK_TIMEOUT_MS) {
      newClickCount = 1;
    } else {
      newClickCount = adminClickCount + 1;
    }

    setAdminClickCount(newClickCount);
    setLastClickTimestamp(now);
    
    if (newClickCount >= ADMIN_CLICK_THRESHOLD) {
      setRole(role === 'user' ? 'admin' : 'user');
      setAdminClickCount(0);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={handleTitleClick}
            title="Commission Cooperative Signup"
            aria-label="Application Title"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTitleClick()}
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.25a.75.75 0 0 1 .75.75v.54l1.536-.512a.75.75 0 0 1 .918.41l1.155 2.158a.75.75 0 0 1-.41.918l-1.537.512v1.024l1.537.512a.75.75 0 0 1 .41.918l-1.155 2.158a.75.75 0 0 1-.918.41l-1.536-.512v.54a.75.75 0 0 1-1.5 0v-.54l-1.536.512a.75.75 0 0 1-.918-.41l-1.155-2.158a.75.75 0 0 1 .41-.918l1.537-.512V9.563l-1.537-.512a.75.75 0 0 1-.41-.918l1.155-2.158a.75.75 0 0 1 .918-.41l1.536.512v-.54A.75.75 0 0 1 12 2.25Zm-5.32 12.264a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 1 1-1.06 1.06L12 10.06l-3.97 3.97a.75.75 0 0 1-1.06 0Zm-2.92.53a.75.75 0 1 0-1.06-1.06l-2.25 2.25a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06L2.31 18l1.44-1.44Zm16.5 0a.75.75 0 1 0-1.06 1.06L21.69 18l-1.44 1.44a.75.75 0 1 0 1.06 1.06l2.25-2.25a.75.75 0 0 0 0-1.06l-2.25-2.25Z" />
             </svg>
            <h1 className="text-xl font-bold text-slate-800">Commission Cooperative Signup</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;