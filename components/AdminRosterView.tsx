import React from 'react';
import type { ClassInfo, Child } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ClassCard from './ClassCard';

interface AdminRosterViewProps {
  classes: ClassInfo[];
  registrations: Record<string, Child[]>;
  onRegistrationChange: (classId: string, children: Child[]) => void;
  onClassInfoChange: (classId: string, field: keyof Omit<ClassInfo, 'id' | 'icon'>, value: string) => void;
  onDeleteClass: (classId: string) => void;
  onAddNewClass: () => void;
}

const AdminRosterView: React.FC<AdminRosterViewProps> = ({ 
  classes, 
  registrations,
  onRegistrationChange,
  onClassInfoChange,
  onDeleteClass,
  onAddNewClass
}) => {
  const handleDownloadRostersPdf = () => {
    const doc = new jsPDF();
    
    const addFooters = () => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 25, doc.internal.pageSize.getHeight() - 10);
            doc.text(`Commission Cooperative Rosters - ${new Date().toLocaleDateString()}`, 15, doc.internal.pageSize.getHeight() - 10);
        }
    };
    
    doc.setFontSize(22);
    doc.text("Class Rosters", 15, 20);

    let firstTable = true;
    classes.forEach(classInfo => {
        const registeredChildren = registrations[classInfo.id]?.filter(c => c.firstName.trim() || c.lastName.trim()) || [];
        
        if (registeredChildren.length > 0) {
            const head = [['#', 'First Name', 'Last Name']];
            const body = registeredChildren.map((child, index) => [
                index + 1,
                child.firstName,
                child.lastName
            ]);

            autoTable(doc, {
                startY: firstTable ? 30 : (doc as any).lastAutoTable.finalY + 15,
                head: [[{ content: `${classInfo.name} (${classInfo.period} Period)`, colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: [79, 70, 229] } }]],
                body: [
                    ...head,
                    ...body
                ],
                theme: 'striped',
                headStyles: { fillColor: [55, 65, 81] },
            });
            firstTable = false;
        }
    });

    addFooters();
    doc.save("class-rosters.pdf");
  };

  const handlePrintRostersPdf = () => {
    const doc = new jsPDF();
    
    const addFooters = () => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 25, doc.internal.pageSize.getHeight() - 10);
            doc.text(`Commission Cooperative Rosters - ${new Date().toLocaleDateString()}`, 15, doc.internal.pageSize.getHeight() - 10);
        }
    };
    
    classes.forEach((classInfo, classIndex) => {
        const registeredChildren = registrations[classInfo.id]?.filter(c => c.firstName.trim() || c.lastName.trim()) || [];
        
        if (registeredChildren.length > 0) {
            if (classIndex > 0) {
              doc.addPage();
            }
            doc.setFontSize(22);
            doc.text("Class Roster", 15, 20);

            const head = [['#', 'First Name', 'Last Name']];
            const body = registeredChildren.map((child, index) => [
                index + 1,
                child.firstName,
                child.lastName
            ]);

            autoTable(doc, {
                startY: 30,
                head: [[{ content: `${classInfo.name} (${classInfo.period} Period)`, colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: [79, 70, 229] } }]],
                body: [
                    ...head,
                    ...body
                ],
                theme: 'striped',
                headStyles: { fillColor: [55, 65, 81] },
            });
        }
    });

    addFooters();
    doc.save("class-rosters-printable.pdf");
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a.75.75 0 0 0-1.5 0v.25a.75.75 0 0 0 1.5 0v-.25ZM12.75 15.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Z" clipRule="evenodd" />
                <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1ZM9.75 15.75a.75.75 0 0 0-1.5 0v.25a.75.75 0 0 0 1.5 0v-.25Zm2.25.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75ZM12 10.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
            </svg>
            <h2 className="text-2xl font-bold text-slate-900">Class Rosters</h2>
        </div>
        <div className="flex items-center gap-4">
            <button
                onClick={onAddNewClass}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 whitespace-nowrap"
            >
                Add New Class
            </button>
            <button
                onClick={handleDownloadRostersPdf}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center gap-2"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Download Rosters (PDF)</span>
            </button>
            <button
                onClick={handlePrintRostersPdf}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center gap-2"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Print Rosters (PDF)</span>
            </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {classes.map((classInfo) => (
            <ClassCard
                key={classInfo.id}
                classInfo={classInfo}
                registeredChildren={registrations[classInfo.id] || []}
                onRegistrationChange={(children) => onRegistrationChange(classInfo.id, children)}
                isReadOnly={false}
                isClassInfoEditable={true}
                onClassInfoChange={(field, value) => onClassInfoChange(classInfo.id, field, value)}
                onDelete={() => onDeleteClass(classInfo.id)}
            />
        ))}
      </div>
    </div>
  );
};

export default AdminRosterView;