import React from 'react';
import { Collaborator, CalculationResult } from '../types';
import { calculateResults, formatCurrency } from '../utils/calculations';
import { Users, Plus, User, Calculator } from 'lucide-react';

interface Props {
  collaborators: Collaborator[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const Sidebar: React.FC<Props> = ({ collaborators, activeId, onSelect, onAdd }) => {
  
  // Calculate Global Totals
  const globalTotals = collaborators.reduce((acc, curr) => {
    const res = calculateResults(curr);
    return {
      s1: acc.s1 + res.scenario1Total,
      s2: acc.s2 + res.scenario2Total,
      s3: acc.s3 + res.scenario3Total,
    };
  }, { s1: 0, s2: 0, s3: 0 });

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
             <Calculator className="text-porta-accent" size={24} />
             <h1 className="text-xl font-bold text-porta-dark tracking-tight">Calculadora Porta</h1>
        </div>
        <p className="text-xs text-gray-400 pl-8">Herramienta Laboral LFT</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Colaboradores</h3>
            <button 
                onClick={onAdd}
                className="p-1.5 rounded-full hover:bg-gray-100 text-porta-accent transition-colors"
                title="Agregar Colaborador"
            >
                <Plus size={18} />
            </button>
        </div>

        <div className="space-y-2">
            {collaborators.map(c => (
                <button
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
                        activeId === c.id 
                        ? 'bg-porta-dark text-white shadow-md' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <div className={`p-1.5 rounded-full ${activeId === c.id ? 'bg-white/10' : 'bg-white'}`}>
                        <User size={16} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className={`text-[10px] truncate ${activeId === c.id ? 'text-gray-300' : 'text-gray-400'}`}>
                            {c.id.slice(0, 4)}...
                        </p>
                    </div>
                </button>
            ))}
        </div>
      </div>

      <div className="p-5 bg-gray-50 border-t border-gray-200">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resumen Global</h3>
          <div className="space-y-2">
              <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Finiquitos:</span>
                  <span className="font-medium text-gray-700">{formatCurrency(globalTotals.s1)}</span>
              </div>
              <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Negociado:</span>
                  <span className="font-medium text-porta-accent">{formatCurrency(globalTotals.s2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Riesgo Total:</span>
                  <span className="font-medium text-red-500">{formatCurrency(globalTotals.s3)}</span>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Sidebar;
