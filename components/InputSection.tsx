import React from 'react';
import { Collaborator } from '../types';
import { HelpCircle, Trash2 } from 'lucide-react';

interface Props {
  data: Collaborator;
  onChange: (id: string, field: keyof Collaborator, value: any) => void;
  onClear: () => void;
  onDelete: () => void;
}

const InputSection: React.FC<Props> = ({ data, onChange, onClear, onDelete }) => {
  
  const handleChange = (field: keyof Collaborator, value: string | number) => {
    let finalValue = value;
    if (typeof value === 'string' && ['dailySalary', 'aguinaldoDays', 'vacationPremiumPkg', 'minimumWage', 'unpaidVacationDays', 'pendingBonuses'].includes(field)) {
       finalValue = parseFloat(value) || 0;
    }
    onChange(data.id, field, finalValue);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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

        {/* Salarios */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Salario Diario Base</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">$</span>
            <input
              type="number"
              className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-porta-accent outline-none"
              value={data.dailySalary || ''}
              onChange={(e) => handleChange('dailySalary', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
            <div className="flex items-center gap-1 mb-1">
                <label className="block text-sm font-medium text-gray-600">Salario Mínimo Vigente</label>
                <div className="group relative">
                    <HelpCircle size={14} className="text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded hidden group-hover:block z-10">
                        Base para tope de Prima de Antigüedad.
                    </div>
                </div>
            </div>
            <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">$</span>
                <input
                type="number"
                className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-porta-accent outline-none"
                value={data.minimumWage}
                onChange={(e) => handleChange('minimumWage', e.target.value)}
                />
            </div>
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
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-porta-accent outline-none"
            value={data.aguinaldoDays}
            onChange={(e) => handleChange('aguinaldoDays', e.target.value)}
          />
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
          <label className="block text-sm font-medium text-gray-600 mb-1">Días Vacaciones No Gozadas</label>
          <input
            type="number"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-porta-accent outline-none"
            value={data.unpaidVacationDays}
            onChange={(e) => handleChange('unpaidVacationDays', e.target.value)}
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
