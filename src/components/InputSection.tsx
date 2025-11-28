import React from 'react';
import { Collaborator, CalculationResult } from '../types';
import { HelpCircle, Trash2, AlertTriangle, Calculator, Lock } from 'lucide-react';
import { calculateResults, formatCurrency } from '../utils/calculations';

interface Props {
  data: Collaborator;
  onChange: (id: string, field: keyof Collaborator, value: any) => void;
  onClear: () => void;
  onDelete: () => void;
}

const InputSection: React.FC<Props> = ({ data, onChange, onClear, onDelete }) => {
  
  // Cálculo temporal para mostrar el SDI estimado en el placeholder/value
  const tempResults = calculateResults(data);
  const currentSdi = tempResults.sdi;

  // Factor derivado de tu ejemplo: Costo 33400 / Bruto 25000 = 1.336
  const FACTOR_COST_TO_GROSS = 1.336;

  const handleChange = (field: keyof Collaborator, value: string | number) => {
    let finalValue = value;
    if (typeof value === 'string' && ['monthlyPayrollCost', 'dailySalary', 'manualSdi', 'aguinaldoDays', 'vacationPremiumPkg', 'minimumWage', 'vacationDaysTaken', 'pendingBonuses'].includes(field)) {
       finalValue = value === '' ? 0 : parseFloat(value);
    }

    // Lógica especial para el Costo de Nómina (Dato Maestro)
    if (field === 'monthlyPayrollCost') {
        const cost = typeof finalValue === 'number' ? finalValue : 0;
        
        // 1. Calcular Bruto Mensual = Costo / Factor
        const grossMonthly = cost > 0 ? cost / FACTOR_COST_TO_GROSS : 0;
        
        // 2. Calcular Diario = Bruto / 30
        const newDaily = grossMonthly / 30;
        
        onChange(data.id, 'monthlyPayrollCost', cost);
        onChange(data.id, 'dailySalary', newDaily);
        // Reseteamos manualSdi para que se recalcule automáticamente con el nuevo diario
        onChange(data.id, 'manualSdi', 0);
        return;
    }

    onChange(data.id, field, finalValue);
  };

  const handleBlurAguinaldo = () => {
    if (data.aguinaldoDays < 15) {
      onChange(data.id, 'aguinaldoDays', 15);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-porta-dark">Datos del Colaborador</h2>
        <div className="flex gap-2">
           <button 
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-porta-dark px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            Limpiar Campos
          </button>
           <button 
            onClick={onDelete}
            className="text-sm text-red-500 hover:text-red-700 px-3 py-1 border border-red-100 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
          >
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identificación */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Completo</label>
          <input
            type="text"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-porta-accent focus:border-transparent outline-none transition-all"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        {/* INPUT MAESTRO: COSTO NOMINA */}
        <div className="col-span-1 md:col-span-2 bg-orange-50/50 p-5 rounded-xl border border-porta-accent/20">
             <div className="flex items-center gap-2 mb-2">
                 <Calculator size={20} className="text-porta-accent" />
                 <label className="block text-sm font-bold text-gray-700">Costo Total Nómina Mensual</label>
             </div>
             <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-500 font-semibold">$</span>
                <input
                    type="number"
                    className="w-full pl-8 p-3 bg-white border border-porta-accent/30 rounded-lg focus:ring-2 focus:ring-porta-accent outline-none text-xl font-bold text-gray-800 shadow-sm"
                    value={data.monthlyPayrollCost || ''}
                    onChange={(e) => handleChange('monthlyPayrollCost', e.target.value)}
                    placeholder="0.00"
                    autoFocus
                />
             </div>
             <p className="text-xs text-gray-500 mt-2">
                 Ingrese el costo total mensual (incluyendo carga social). El sistema calculará el Salario Diario Base y el SDI automáticamente.
             </p>
        </div>

        {/* Salarios Calculados (Read Only) */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
             Salario Diario Base <Lock size={12} className="opacity-50"/>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">$</span>
            <input
              type="number"
              disabled
              className="w-full pl-8 p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-medium cursor-not-allowed"
              value={data.dailySalary ? Number(data.dailySalary.toFixed(2)) : ''}
              placeholder="0.00"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Calculado (Costo ÷ 1.336 ÷ 30)</p>
        </div>

        <div>
            <div className="flex items-center gap-1 mb-1">
                <label className="block text-sm font-medium text-gray-500 flex items-center gap-1">
                    SDI Calculado <Lock size={12} className="opacity-50"/>
                </label>
            </div>
            <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">$</span>
                <input
                    type="text"
                    disabled
                    className="w-full pl-8 p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 font-medium cursor-not-allowed"
                    value={formatCurrency(currentSdi).replace('$', '')}
                />
            </div>
             <p className="text-[10px] text-gray-400 mt-1">
                Base + Factor Integración Prestaciones
            </p>
        </div>

        {/* Fechas */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Ingreso</label>
          <input
            type="date"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-porta-accent outline-none"
            value={data.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Baja</label>
          <input
            type="date"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-porta-accent outline-none"
            value={data.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>

        {/* Prestaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Días de Aguinaldo</label>
          <input
            type="number"
            className={`w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 outline-none ${data.aguinaldoDays < 15 ? 'border-amber-300 focus:ring-amber-200' : 'border-gray-200 focus:ring-porta-accent'}`}
            value={data.aguinaldoDays}
            onChange={(e) => handleChange('aguinaldoDays', e.target.value)}
            onBlur={handleBlurAguinaldo}
          />
          {data.aguinaldoDays < 15 && (
              <div className="flex items-center gap-1 mt-1 text-amber-600 text-xs">
                  <AlertTriangle size={12} />
                  <span>Mínimo de Ley: 15 días (Se corregirá a 15)</span>
              </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Prima Vacacional (%)</label>
          <input
            type="number"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-porta-accent outline-none"
            value={data.vacationPremiumPkg}
            onChange={(e) => handleChange('vacationPremiumPkg', e.target.value)}
          />
        </div>

        {/* Extras */}
        <div>
          <div className="flex items-center gap-1 mb-1">
             <label className="block text-sm font-medium text-gray-600">Días Disfrutados (Histórico)</label>
             <div className="group relative">
                <HelpCircle size={14} className="text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded hidden group-hover:block z-10">
                    Suma total de días de vacaciones que el empleado YA tomó durante toda la relación laboral.
                </div>
            </div>
          </div>
          <input
            type="number"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-porta-accent outline-none"
            value={data.vacationDaysTaken}
            onChange={(e) => handleChange('vacationDaysTaken', e.target.value)}
            placeholder="0"
          />
        </div>

         <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Bonos Pendientes ($)</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">$</span>
            <input
                type="number"
                className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-porta-accent outline-none"
                value={data.pendingBonuses}
                onChange={(e) => handleChange('pendingBonuses', e.target.value)}
                placeholder="0.00"
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Prestaciones Adicionales / Notas</label>
            <textarea 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-porta-accent outline-none h-20 resize-none"
                placeholder="Describa vales, fondo de ahorro, etc. (Solo informativo)"
                value={data.additionalBenefits}
                onChange={(e) => handleChange('additionalBenefits', e.target.value)}
            />
        </div>

      </div>
    </div>
  );
};

export default InputSection;