import React, { useState } from 'react';
import { formatCurrency } from '../utils/calculations';
import { Calculator, X, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (dailySalary: number) => void;
}

const SalaryEstimator: React.FC<Props> = ({ isOpen, onClose, onApply }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [inputType, setInputType] = useState<'cost' | 'gross' | 'net'>('cost');

  if (!isOpen) return null;

  // Factors derived from user examples:
  // Gross (25000) -> Net (20700) : Factor ~0.828 (17.2% retention)
  // Gross (25000) -> Cost (33400) : Factor ~1.336 (33.6% burden)
  
  const FACTOR_NET_TO_GROSS = 1 / 0.828; 
  const FACTOR_COST_TO_GROSS = 1 / 1.336;
  const DAYS_PER_MONTH = 30; // Standard for monthly to daily conversion

  const calculate = () => {
    if (amount === '' || amount <= 0) return { gross: 0, daily: 0 };
    
    let grossMonthly = 0;

    switch (inputType) {
      case 'gross':
        grossMonthly = amount;
        break;
      case 'net':
        grossMonthly = amount * FACTOR_NET_TO_GROSS;
        break;
      case 'cost':
        grossMonthly = amount * FACTOR_COST_TO_GROSS;
        break;
    }

    return {
      gross: grossMonthly,
      daily: grossMonthly / DAYS_PER_MONTH
    };
  };

  const result = calculate();

  const handleApply = () => {
    if (result.daily > 0) {
      onApply(result.daily);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-porta-dark">
            <Calculator size={20} className="text-porta-accent" />
            <h3 className="font-semibold">Calculadora Inversa</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Monto Mensual ($)</label>
            <input 
              type="number" 
              autoFocus
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-porta-accent outline-none text-lg font-medium"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-600 mb-2">Tipo de Monto</label>
             <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setInputType('cost')}
                  className={`p-2 text-xs rounded-md border transition-all ${inputType === 'cost' ? 'bg-porta-dark text-white border-porta-dark' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  Costo Nómina
                </button>
                <button 
                  onClick={() => setInputType('gross')}
                  className={`p-2 text-xs rounded-md border transition-all ${inputType === 'gross' ? 'bg-porta-dark text-white border-porta-dark' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  Sueldo Bruto
                </button>
                <button 
                  onClick={() => setInputType('net')}
                  className={`p-2 text-xs rounded-md border transition-all ${inputType === 'net' ? 'bg-porta-dark text-white border-porta-dark' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  Sueldo Neto
                </button>
             </div>
             <p className="text-[10px] text-gray-400 mt-2 text-justify leading-tight">
               {inputType === 'cost' && "Considera Carga Social aprox. 33.6% (ISN, IMSS Patronal, RCV)."}
               {inputType === 'gross' && "Monto antes de impuestos y retenciones."}
               {inputType === 'net' && "Considera retención aprox. 17.2% (ISR, IMSS Obrero)."}
             </p>
          </div>

          {/* Results Preview */}
          <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-100">
             <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Sueldo Bruto Est.:</span>
                <span className="text-sm font-medium text-gray-700">{formatCurrency(result.gross)}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs text-porta-accent font-bold uppercase">Salario Diario Base:</span>
                <span className="text-lg font-bold text-porta-accent">{formatCurrency(result.daily)}</span>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">Cancelar</button>
          <button 
            onClick={handleApply}
            disabled={!amount || amount <= 0}
            className="px-4 py-2 bg-porta-accent hover:bg-orange-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Aplicar Salario <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default SalaryEstimator;