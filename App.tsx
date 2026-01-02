import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import { collection, getDocs, doc, setDoc, addDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { ClassInfo, Role, Child } from './types';
import Header from './components/Header';
import ClassCard from './components/ClassCard';
import AdminRosterView from './components/AdminRosterView';
import AdminLogin from './components/AdminLogin';
import { PaintBrushIcon, MusicNoteIcon, BookOpenIcon, BeakerIcon, AGE_RANGE_OPTIONS, PERIOD_OPTIONS } from './constants';

const toProperCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('user');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [masterRegistrations, setMasterRegistrations] = useState<Record<string, Child[]>>({});
  const [currentUserRegistrations, setCurrentUserRegistrations] = useState<Record<string, Child[]>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ClassInfo, direction: 'asc' | 'desc' }>({ key: 'ageRange', direction: 'asc' });

  useEffect(() => {
    const fetchData = async () => {
        const classesQuerySnapshot = await getDocs(collection(db, "classes"));
        const classesData = classesQuerySnapshot.docs.map(doc => {
            const data = doc.data();
            let icon;
            switch (data.icon) {
                case 'PaintBrushIcon': icon = PaintBrushIcon; break;
                case 'MusicNoteIcon': icon = MusicNoteIcon; break;
                case 'BookOpenIcon': icon = BookOpenIcon; break;
                case 'BeakerIcon':
                default: icon = BeakerIcon;
            }
            return {
                id: doc.id,
                name: data.name || 'Unnamed Class',
                description: data.description || '',
                ageRange: data.ageRange || '',
                period: data.period || '1st',
                icon: icon,
                instructor: data.instructor || '',
            } as ClassInfo;
        });
        classesData.sort((a, b) => b.id.localeCompare(a.id));
        setClasses(classesData);

        const registrationsQuerySnapshot = await getDocs(collection(db, "registrations"));
        const registrationsData: Record<string, Child[]> = {};
        registrationsQuerySnapshot.forEach(doc => {
            registrationsData[doc.id] = doc.data().children || [];
        });
        setMasterRegistrations(registrationsData);
    };

    fetchData();
  }, []);

  const sortedClasses = useMemo(() => {
    const sortableClasses = [...classes];
    sortableClasses.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'ageRange') {
            aValue = AGE_RANGE_OPTIONS.indexOf(a.ageRange);
            bValue = AGE_RANGE_OPTIONS.indexOf(b.ageRange);
        } else if (sortConfig.key === 'period') {
            aValue = PERIOD_OPTIONS.indexOf(a.period);
            bValue = PERIOD_OPTIONS.indexOf(b.period);
        } else {
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
    return sortableClasses;
  }, [classes, sortConfig]);

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
            error = `Error: ${toProperCase(child.firstName)} ${toProperCase(child.lastName)} is registered for multiple classes in the ${currentClass.period} period.`;
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

  const handleMasterRegistrationChange = async (classId: string, children: Child[]) => {
    const formattedChildren = children.map(child => ({
        ...child,
        firstName: toProperCase(child.firstName.trim()),
        lastName: toProperCase(child.lastName.trim())
    }));

    setMasterRegistrations(prev => ({...prev, [classId]: formattedChildren}));

    try {
      const registrationRef = doc(db, "registrations", classId);
      const validChildren = formattedChildren.filter(c => c.firstName && c.lastName);
      await setDoc(registrationRef, { children: validChildren }, { merge: true });
    } catch (error) {
      console.error("Error updating registration: ", error);
    }
  }

  const handleClassInfoChange = async (classId: string, field: keyof Omit<ClassInfo, 'id' | 'icon'>, value: string) => {
    const processedValue = field === 'instructor' ? toProperCase(value) : value;
    const newClasses = classes.map(c =>
        c.id === classId ? { ...c, [field]: processedValue } : c
    );
    setClasses(newClasses);

    try {
        const classRef = doc(db, "classes", classId);
        await setDoc(classRef, { [field]: processedValue }, { merge: true });
    } catch (error) {
        console.error("Error updating class info: ", error);
    }
  };
  
  const handleAddNewClass = async () => {
    const tempId = `temp-${Date.now()}`;
    const newClassData = {
        name: 'New Class Name',
        description: 'Enter a description for the new class.',
        ageRange: 'Grades K-2',
        period: '1st' as const,
        iconName: 'BeakerIcon',
        instructor: '',
    };

    const newClassForUI: ClassInfo = {
        id: tempId,
        name: newClassData.name,
        description: newClassData.description,
        ageRange: newClassData.ageRange,
        period: newClassData.period,
        icon: BeakerIcon,
        instructor: newClassData.instructor,
    };

    setClasses(prevClasses => [newClassForUI, ...prevClasses]);

    try {
        const docRef = await addDoc(collection(db, "classes"), newClassData);
        
        setClasses(prevClasses => {
            const updatedClasses = prevClasses.map(c => (c.id === tempId ? { ...c, id: docRef.id } : c));
            updatedClasses.sort((a, b) => b.id.localeCompare(a.id));
            return updatedClasses;
        });

    } catch (error) {
        console.error("Error adding new class: ", error);
        setClasses(prevClasses => prevClasses.filter(c => c.id !== tempId));
        alert("Failed to add the new class. Please check your Firestore security rules and try again.");
    }
  };

  const handleDeleteClass = async (classId: string) => {
    const originalClasses = classes;
    setClasses(prevClasses => prevClasses.filter(c => c.id !== classId));

    try {
        await deleteDoc(doc(db, "classes", classId));
        await deleteDoc(doc(db, "registrations", classId));
        setMasterRegistrations(prev => {
            const newMaster = { ...prev };
            delete newMaster[classId];
            return newMaster;
        });

    } catch (error) {
        console.error("Error deleting class: ", error);
        setClasses(originalClasses);
        alert("Failed to delete the class. Please check your Firestore security rules and try again.");
    }
  };

  const handleSubmit = async () => {
    for (const [classId, newChildren] of Object.entries(currentUserRegistrations)) {
        if (newChildren.some(c => c.firstName.trim() && c.lastName.trim())) {
            const registrationRef = doc(db, "registrations", classId);
            const docSnap = await getDoc(registrationRef);
            const existingChildren = docSnap.exists() ? docSnap.data().children || [] : [];
            const existingNames = new Set(existingChildren.map(c => `${c.firstName.trim().toLowerCase()}|${c.lastName.trim().toLowerCase()}`));
            
            const formattedChildren = newChildren.map(child => ({
                ...child,
                firstName: toProperCase(child.firstName.trim()),
                lastName: toProperCase(child.lastName.trim())
            }));

            const uniqueNewChildren = formattedChildren.filter(c => {
                const fullNameKey = `${c.firstName.toLowerCase()}|${c.lastName.toLowerCase()}`;
                return c.firstName && c.lastName && !existingNames.has(fullNameKey);
            });

            if (uniqueNewChildren.length > 0) {
                await setDoc(registrationRef, { children: [...existingChildren, ...uniqueNewChildren] }, { merge: true });
            }
        }
    }
    
    setMasterRegistrations(prevMaster => {
        const newMaster = { ...prevMaster };
        Object.entries(currentUserRegistrations).forEach(([classId, newChildren]) => {
            const existingChildren = newMaster[classId] || [];
            const existingNames = new Set(existingChildren.map(c => `${c.firstName.trim().toLowerCase()}|${c.lastName.trim().toLowerCase()}`));
            
            const formattedChildren = newChildren.map(child => ({
                ...child,
                firstName: toProperCase(child.firstName.trim()),
                lastName: toProperCase(child.lastName.trim())
            }));

            const uniqueNewChildren = formattedChildren.filter(c => {
                const fullNameKey = `${c.firstName.toLowerCase()}|${c.lastName.toLowerCase()}`;
                return c.firstName && c.lastName && !existingNames.has(fullNameKey);
            });
            if (uniqueNewChildren.length > 0) {
              newMaster[classId] = [...existingChildren, ...uniqueNewChildren];
            }
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

      if (yPosition > 270) { 
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
          doc.text(`- ${toProperCase(child.firstName)} ${toProperCase(child.lastName)}`, 25, yPosition);
          yPosition += 7;
      });
      yPosition += 5; 
    });

    doc.save("registration-summary.pdf");
  };

  const requestSort = (key: keyof ClassInfo) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header role={role} setRole={handleRoleChange} />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {role === 'user' && (
          <>
            {!isSubmitted ? (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">Class Registration</h1>
                      <p className="text-slate-600">Enter the name of your child or children for each class below.</p>
                  </div>
                  <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-slate-600">Sort by:</span>
                        <button onClick={() => requestSort('ageRange')} className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm ${sortConfig.key === 'ageRange' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'} transition-colors`}>
                            Age Group {sortConfig.key === 'ageRange' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </button>
                        <button onClick={() => requestSort('period')} className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm ${sortConfig.key === 'period' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'} transition-colors`}>
                            Period {sortConfig.key === 'period' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </button>
                    </div>
                </div>
                <div className="space-y-6">
                  {sortedClasses.map((classInfo) => (
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
                                <li key={child.id} className="text-indigo-600">{toProperCase(child.firstName)} {toProperCase(child.lastName)}</li>
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
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Classes</h1>
                            <p className="text-slate-600">Modify class details and registered children. Changes are saved automatically.</p>
                        </div>
                        <button
                            onClick={handleAddNewClass}
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 whitespace-nowrap"
                        >
                            Add New Class
                        </button>
                    </div>
                    <div className="space-y-6">
                       {classes.map((classInfo) => (
                        <ClassCard
                          key={classInfo.id}
                          classInfo={classInfo}
                          registeredChildren={masterRegistrations[classInfo.id] || []}
                          onRegistrationChange={(children) => handleMasterRegistrationChange(classInfo.id, children)}
                          isReadOnly={false}
                          isClassInfoEditable={true}
                          onClassInfoChange={(field, value) => handleClassInfoChange(classInfo.id, field, value)}
                          onDelete={() => handleDeleteClass(classInfo.id)}
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
