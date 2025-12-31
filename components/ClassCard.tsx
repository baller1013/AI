import React, { useState } from 'react';
import type { ClassInfo, Child } from '../types';
import { AGE_RANGE_OPTIONS, PERIOD_OPTIONS } from '../constants';

interface ClassCardProps {
    classInfo: ClassInfo;
    registeredChildren: Child[];
    onRegistrationChange: (children: Child[]) => void;
    isReadOnly: boolean;
    isClassInfoEditable?: boolean;
    onClassInfoChange?: (field: keyof Omit<ClassInfo, 'id' | 'icon'>, value: string) => void;
    onDelete?: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ 
    classInfo, 
    registeredChildren, 
    onRegistrationChange, 
    isReadOnly, 
    isClassInfoEditable = false,
    onClassInfoChange,
    onDelete 
}) => {
    const { id, name, description, ageRange, period, icon: Icon, instructor } = classInfo;
    const [children, setChildren] = useState<Child[]>(registeredChildren);

    const handleAddChild = () => {
        const newId = `c${children.length + 1}`;
        const newChildren = [...children, { id: newId, firstName: '', lastName: '' }];
        setChildren(newChildren);
        onRegistrationChange(newChildren);
    };

    const handleChildNameChange = (index: number, field: 'firstName' | 'lastName', value: string) => {
        const newChildren = children.map((child, i) => 
            i === index ? { ...child, [field]: value } : child
        );
        setChildren(newChildren);
        onRegistrationChange(newChildren);
    };

    const handleRemoveChild = (index: number) => {
        const newChildren = children.filter((_, i) => i !== index);
        setChildren(newChildren);
        onRegistrationChange(newChildren);
    };

    const handleFieldChange = (field: keyof Omit<ClassInfo, 'id' | 'icon'>, value: string) => {
        if (onClassInfoChange) {
            onClassInfoChange(field, value);
        }
    };
    
    const handleDeleteClick = () => {
        if (onDelete && window.confirm(`Are you sure you want to delete the class "${name}"? This action cannot be undone.`)) {
            onDelete();
        }
    };

    return (
        <div key={id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-grow flex items-start">
                        <div className="mr-4 flex-shrink-0">
                           {Icon && <Icon className="h-12 w-12 text-indigo-500" />} 
                        </div>
                        <div className="flex-grow">
                            {isClassInfoEditable ? (
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => handleFieldChange('name', e.target.value)} 
                                    className="text-xl font-bold text-slate-900 mb-1 w-full p-1 border-b-2 border-transparent focus:border-indigo-500 outline-none transition-colors"
                                />
                            ) : (
                                <h3 className="text-2xl font-bold text-slate-900 mb-1">{name}</h3>
                            )}
                            <div className="flex items-center flex-wrap gap-2 mb-3">
                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">{ageRange}</span>
                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800">{period} Period</span>
                            </div>
                            {isClassInfoEditable ? (
                                <textarea 
                                    value={description} 
                                    onChange={(e) => handleFieldChange('description', e.target.value)} 
                                    className="text-slate-600 mb-3 w-full p-1 border-b-2 border-transparent focus:border-indigo-500 outline-none transition-colors"
                                />
                            ) : (
                                <p className="text-slate-600 mb-3">{description}</p>
                            )}
                            {isClassInfoEditable ? (
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="font-semibold">Instructor:</span>
                                    <input 
                                        type="text" 
                                        value={instructor || ''} 
                                        placeholder="(Optional)"
                                        onChange={(e) => handleFieldChange('instructor', e.target.value)} 
                                        className="text-slate-600 w-full p-1 border-b-2 border-transparent focus:border-indigo-500 outline-none transition-colors"
                                    />
                                </div>
                            ) : (
                                instructor && <p className="text-slate-600 mb-3 font-semibold">Instructor: {instructor}</p>
                            )}
                        </div>
                    </div>
                    {isClassInfoEditable && onDelete && (
                        <button onClick={handleDeleteClick} className="text-red-500 hover:text-red-700 font-semibold p-2 flex-shrink-0 ml-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>

                {!isReadOnly && (
                    <div className="mt-6 border-t pt-6">
                        <h4 className="font-semibold text-slate-800 mb-3">Registered Children:</h4>
                        {children.length > 0 ? (
                            <div className="space-y-3">
                                {children.map((child, index) => (
                                    <div key={child.id} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            value={child.firstName}
                                            onChange={(e) => handleChildNameChange(index, 'firstName', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            value={child.lastName}
                                            onChange={(e) => handleChildNameChange(index, 'lastName', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                        />
                                        <button onClick={() => handleRemoveChild(index)} className="text-slate-400 hover:text-red-600 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">No children registered for this class yet.</p>
                        )}
                         <button onClick={handleAddChild} className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
                            + Add Child
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassCard;
