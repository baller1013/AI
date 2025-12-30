import React from 'react';
import type { ClassInfo, Child } from '../types';
import { AGE_RANGE_OPTIONS, PERIOD_OPTIONS } from '../constants';

interface ClassCardProps {
  classInfo: ClassInfo;
  registeredChildren: Child[];
  onRegistrationChange: (updatedChildren: Child[]) => void;
  isReadOnly: boolean;
  isClassInfoEditable?: boolean;
  onClassInfoChange?: (classId: string, field: 'name' | 'description' | 'ageRange' | 'period', value: string) => void;
}

const toProperCase = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const ClassCard: React.FC<ClassCardProps> = ({ 
  classInfo, 
  registeredChildren, 
  onRegistrationChange, 
  isReadOnly,
  isClassInfoEditable = false,
  onClassInfoChange,
}) => {
  const { id, name, description, ageRange, period, icon: Icon } = classInfo;

  const handleInputChange = (childId: string, field: 'firstName' | 'lastName', value: string) => {
    const formattedValue = toProperCase(value);
    const updatedChildren = registeredChildren.map(child =>
      child.id === childId ? { ...child, [field]: formattedValue } : child
    );
    onRegistrationChange(updatedChildren);
  };

  const handleAddChild = () => {
    const newChild: Child = {
      id: `child-${Date.now()}-${Math.random()}`, // Simple unique ID
      firstName: '',
      lastName: '',
    };
    onRegistrationChange([...registeredChildren, newChild]);
  };

  const handleRemoveChild = (childId: string) => {
    const updatedChildren = registeredChildren.filter(child => child.id !== childId);
    onRegistrationChange(updatedChildren);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
             <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Icon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap justify-between items-baseline gap-2">
               {isClassInfoEditable && onClassInfoChange ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => onClassInfoChange(id, 'name', e.target.value)}
                  aria-label={`Edit class name for ${name}`}
                  className="text-xl font-bold text-slate-900 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-lg px-2 py-1 w-full sm:w-auto flex-grow transition-colors"
                />
              ) : (
                <h3 className="text-xl font-bold text-slate-900">{name}</h3>
              )}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isClassInfoEditable && onClassInfoChange ? (
                  <>
                    <select
                      value={ageRange}
                      onChange={(e) => onClassInfoChange(id, 'ageRange', e.target.value)}
                      aria-label={`Edit age range for ${name}`}
                      className="text-sm font-medium text-indigo-800 bg-indigo-50 border border-transparent hover:border-indigo-300 focus:bg-white focus:border-indigo-500 rounded-full px-3 py-1 transition-colors cursor-pointer"
                    >
                      {AGE_RANGE_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <select
                      value={period}
                      onChange={(e) => onClassInfoChange(id, 'period', e.target.value)}
                      aria-label={`Edit period for ${name}`}
                      className="text-sm font-medium text-indigo-800 bg-indigo-50 border border-transparent hover:border-indigo-300 focus:bg-white focus:border-indigo-500 rounded-full px-3 py-1 transition-colors cursor-pointer"
                    >
                      {PERIOD_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full whitespace-nowrap">{ageRange} | {period} Period</span>
                )}
              </div>
            </div>
             {isClassInfoEditable && onClassInfoChange ? (
              <textarea
                value={description}
                onChange={(e) => onClassInfoChange(id, 'description', e.target.value)}
                aria-label={`Edit class description for ${name}`}
                rows={2}
                className="mt-1 text-slate-600 w-full bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-lg px-2 py-1 transition-colors"
              />
            ) : (
              <p className="mt-1 text-slate-600">{description}</p>
            )}
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Registered Children
              </label>
              <div className="space-y-3">
                {registeredChildren.map((child, index) => (
                  <div key={child.id} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={child.firstName}
                      onChange={(e) => handleInputChange(child.id, 'firstName', e.target.value)}
                      readOnly={isReadOnly}
                      aria-label={`Child ${index + 1} First Name`}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors read-only:bg-slate-100"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={child.lastName}
                      onChange={(e) => handleInputChange(child.id, 'lastName', e.target.value)}
                      readOnly={isReadOnly}
                      aria-label={`Child ${index + 1} Last Name`}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors read-only:bg-slate-100"
                    />
                    {!isReadOnly && (
                      <button
                        onClick={() => handleRemoveChild(child.id)}
                        aria-label={`Remove Child ${index + 1}`}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                 {registeredChildren.length === 0 && !isReadOnly && (
                    <p className="text-sm text-slate-500 italic">Click the button below to add a child.</p>
                 )}
              </div>
              {!isReadOnly && (
                 <button 
                  onClick={handleAddChild}
                  className="mt-3 flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    <span>Add Child</span>
                 </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;