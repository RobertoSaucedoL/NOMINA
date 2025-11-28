import React, { useState, useMemo } from 'react';
import { Collaborator, DEFAULT_COLLABORATOR } from './types';
import Sidebar from './components/Sidebar';
import InputSection from './components/InputSection';
import ResultsTable from './components/ResultsTable';
import NegotiationCard from './components/NegotiationCard';
import { calculateResults, formatCurrency, formatYears } from './utils/calculations';

const App: React.FC = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([{ ...DEFAULT_COLLABORATOR }]);
  const [activeId, setActiveId] = useState<string>('1');

  const activeCollaborator = useMemo(() => 
    collaborators.find(c => c.id === activeId) || collaborators[0], 
  [collaborators, activeId]);

  const results = useMemo(() => calculateResults(activeCollaborator), [activeCollaborator]);

  const handleUpdateCollaborator = (id: string, field: keyof Collaborator, value: any) => {
    setCollaborators(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleAddCollaborator = () => {
    const newId = Date.now().toString();
    setCollaborators(prev => [...prev, { ...DEFAULT_COLLABORATOR, id: newId, name: `Colaborador ${prev.length + 1}` }]);
    setActiveId(newId);
  };

  const handleDeleteCollaborator = () => {
    if (collaborators.length <= 1) {
        // Reset if it's the last one
        setCollaborators([{ ...DEFAULT_COLLABORATOR }]);
        return;
    }
    const newColl = collaborators.filter(c => c.id !== activeId);
    setCollaborators(newColl);
    setActiveId(newColl[newColl.length - 1].id);
  };

  const handleClear = () => {
    handleUpdateCollaborator(activeId, 'monthlyPayrollCost', 0);
    handleUpdateCollaborator(activeId, 'dailySalary', 0);
    handleUpdateCollaborator(activeId, 'manualSdi', 0); 
    handleUpdateCollaborator(activeId, 'vacationDaysTaken', 0);
    handleUpdateCollaborator(activeId, 'pendingBonuses', 0);
    handleUpdateCollaborator(activeId, 'additionalBenefits', '');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 font-sans text-porta-dark">
      {/* Sidebar */}
      <Sidebar 
        collaborators={collaborators} 
        activeId={activeId} 
        onSelect={setActiveId}
        onAdd={handleAddCollaborator}
      />

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            
            {/* Header Stats for Active User */}
            <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                   <h2 className="text-2xl font-light text-porta-dark">{activeCollaborator.name}</h2>
                   <p className="text-xs text-gray-400">ID: {activeCollaborator.id}</p>
                </div>
                <div className="flex gap-6 text-sm">
                    <div>
                        <p className="text-gray-400 text-xs">SDI Aplicado</p>
                        <p className="font-semibold text-porta-accent">
                            {formatCurrency(results.sdi)} 
                            {results.isSdiManual && <span className="text-[10px] text-gray-400 ml-1">(Manual)</span>}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Antigüedad</p>
                        <p className="font-semibold">{formatYears(results.antiquityYears)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Días Vac. Año Actual</p>
                        <p className="font-semibold">{results.vacationDaysEntitledCurrentYear}</p>
                    </div>
                </div>
            </div>

            <InputSection 
                data={activeCollaborator} 
                onChange={handleUpdateCollaborator} 
                onClear={handleClear} 
                onDelete={handleDeleteCollaborator}
            />

            <ResultsTable results={results} />

            <NegotiationCard results={results} />

        </div>
      </div>
    </div>
  );
};

export default App;