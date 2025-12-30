import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { INITIAL_CLASSES } from './constants';
import type { ClassInfo, Role, Child } from './types';
import Header from './components/Header';
import ClassCard from './components/ClassCard';
import AdminRosterView from './components/AdminRosterView';
import AdminLogin from './components/AdminLogin';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('user');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [masterRegistrations, setMasterRegistrations] = useState<Record<string, Child[]>>({});
  const [currentUserRegistrations, setCurrentUserRegistrations] = useState<Record<string, Child[]>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [classes, setClasses] = useState<ClassInfo[]>(INITIAL_CLASSES);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  useEffect(() => {
    const childPeriodMap = new Map<string, { period: string; child: Child }>();
    let error: string | null = null;

    for (const classId in currentUserRegistrations) {
      const currentClass = classes.find(c => c.id === classId);
      if (!currentClass) continue;

      for (const child of currentUserRegistrations[classId]) {
        const fullName = `${child.firstName.trim().toLowerCase()}|${child.lastName.trim().toLowerCase()}`;
        if (!child.firstName.trim() || !child.lastName.trim()) continue;

        if (childPeriodMap.has(fullName)) {
          const existingRegistration = childPeriodMap.get(fullName)!;
          if (existingRegistration.period === currentClass.period) {
            error = `Error: ${existingRegistration.child.firstName} ${existingRegistration.child.lastName} is registered for multiple classes in the ${currentClass.period} period.`;
            break;
          }
        }
        childPeriodMap.set(fullName, { period: currentClass.period, child });
      }
      if (error) break;
    }
    setRegistrationError(error);
  }, [currentUserRegistrations, classes]);

  const handleCurrentUserRegistrationChange = (classId: string, children: Child[]) => {
    setCurrentUserRegistrations(prev => ({ ...prev, [classId]: children }));
  };

  const handleMasterRegistrationChange = (classId: string, children: Child[]) => {
    setMasterRegistrations(prev => ({...prev, [classId]: children}));
  }

  const handleClassInfoChange = (classId: string, field: 'name' | 'description' | 'ageRange' | 'period', value: string) => {
    setClasses(prevClasses =>
      prevClasses.map(c =>
        c.id === classId ? { ...c, [field]: value } : c
      )
    );
  };

  const handleSubmit = () => {
    setMasterRegistrations(prevMaster => {
      const newMaster = { ...prevMaster };
      Object.entries(currentUserRegistrations).forEach(([classId, newChildren]) => {
        const existingChildren = newMaster[classId] || [];
        const existingNames = new Set(
          existingChildren.map(c => `${c.firstName.trim().toLowerCase()}|${c.lastName.trim().toLowerCase()}`)
        );
        
        const uniqueNewChildren = newChildren.filter(c => {
          const fullNameKey = `${c.firstName.trim().toLowerCase()}|${c.lastName.trim().toLowerCase()}`;
          return c.firstName.trim() && c.lastName.trim() && !existingNames.has(fullNameKey);
        });
        
        newMaster[classId] = [...existingChildren, ...uniqueNewChildren];
      });
      return newMaster;
    });
    setIsSubmitted(true);
  };

  const handleStartNewRegistration = () => {
    setCurrentUserRegistrations({});
    setIsSubmitted(false);
  };
  
  const handleRoleChange = (newRole: Role) => {
    if (newRole === 'user') {
      setIsAdminAuthenticated(false);
    }
    setRole(newRole);
  }
  
  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
  }
  
  const activeUserRegistrations = Object.entries(currentUserRegistrations).filter(([, children]) => 
    children && children.some(c => c.firstName.trim() !== '' && c.lastName.trim() !== '')
  );

  const handleDownloadSummaryPdf = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Registration Summary", 20, 20);
    
    doc.setFontSize(12);
    doc.text("Thank you for registering for Commission Cooperative classes!", 20, 30);
    
    let yPosition = 45;
    
    activeUserRegistrations.forEach(([classId, children]) => {
      const classInfo = classes.find(c => c.id === classId);
      const validChildren = children.filter(c => c.firstName.trim() || c.lastName.trim());
      if (!classInfo || validChildren.length === 0) return;

      if (yPosition > 270) { // Simple page break
          doc.addPage();
          yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${classInfo.name} (${classInfo.ageRange} | ${classInfo.period} Period)`, 20, yPosition);
      yPosition += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      validChildren.forEach(child => {
          doc.text(`- ${child.firstName} ${child.lastName}`, 25, yPosition);
          yPosition += 7;
      });
      yPosition += 5; // Add a little space between classes
    });

    doc.save("registration-summary.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header role={role} setRole={handleRoleChange} />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {role === 'user' && (
          <>
            {!isSubmitted ? (
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Class Registration</h1>
                <p className="text-slate-600 mb-8">Enter the name of your child or children for each class below.</p>
                <div className="space-y-6">
                  {classes.map((classInfo) => (
                    <ClassCard
                      key={classInfo.id}
                      classInfo={classInfo}
                      registeredChildren={currentUserRegistrations[classInfo.id] || []}
                      onRegistrationChange={(children) => handleCurrentUserRegistrationChange(classInfo.id, children)}
                      isReadOnly={false}
                    />
                  ))}
                </div>
                <div className="mt-8 text-right">
                    {registrationError && (
                        <div className="mb-4 text-red-600 font-semibold p-3 bg-red-50 rounded-lg text-center">
                        {registrationError}
                        </div>
                    )}
                  <button
                    onClick={handleSubmit}
                    disabled={activeUserRegistrations.length === 0 || !!registrationError}
                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Submit Registration
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Thank You!</h2>
                <p className="text-slate-600 mb-6">Your registration has been submitted.</p>
                <div className="text-left bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6 max-w-md mx-auto">
                  <h3 className="font-semibold text-lg text-slate-800 border-b pb-2 mb-4">Registration Summary</h3>
                  <ul className="space-y-4">
                    {activeUserRegistrations.map(([classId, children]) => {
                      const classInfo = classes.find(c => c.id === classId);
                      const validChildren = children.filter(c => c.firstName.trim() || c.lastName.trim());
                      if (validChildren.length === 0) return null;
                      return (
                        <li key={classId}>
                          <p className="font-semibold text-slate-700">{classInfo?.name}</p>
                           <ul className="list-disc list-inside pl-2 mt-1">
                              {validChildren.map(child => (
                                <li key={child.id} className="text-indigo-600">{child.firstName} {child.lastName}</li>
                              ))}
                          </ul>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                <div className="mt-8 border-t border-slate-200 pt-8 max-w-md mx-auto">
                    <h3 className="font-semibold text-lg text-slate-800 mb-2">Download Your Summary</h3>
                    <p className="text-slate-600 mb-4 text-sm">Click the button below to download a PDF copy of your registration for your records.</p>
                    <button
                        onClick={handleDownloadSummaryPdf}
                        className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Download Summary (PDF)</span>
                    </button>
                </div>

                <button
                  onClick={handleStartNewRegistration}
                  className="mt-8 px-8 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Make Another Registration
                </button>
              </div>
            )}
          </>
        )}

        {role === 'admin' && (
          <>
            {!isAdminAuthenticated ? (
              <AdminLogin onLoginSuccess={handleLoginSuccess} onGoBack={() => handleRoleChange('user')} />
            ) : (
              <div>
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Registrations</h1>
                    <p className="text-slate-600 mb-8">Modify class details and the list of registered children. Changes are saved automatically.</p>
                    <div className="space-y-6">
                       {classes.map((classInfo) => (
                        <ClassCard
                          key={classInfo.id}
                          classInfo={classInfo}
                          registeredChildren={masterRegistrations[classInfo.id] || []}
                          onRegistrationChange={(children) => handleMasterRegistrationChange(classInfo.id, children)}
                          isReadOnly={false}
                          isClassInfoEditable={true}
                          onClassInfoChange={handleClassInfoChange}
                        />
                      ))}
                    </div>
                </div>
                <AdminRosterView classes={classes} registrations={masterRegistrations} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
