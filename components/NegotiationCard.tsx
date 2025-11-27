import React from 'react';
import { CalculationResult } from '../types';
import { formatCurrency } from '../utils/calculations';
import { FileText, ShieldAlert, CheckCircle } from 'lucide-react';

interface Props {
  results: CalculationResult;
}

const NegotiationCard: React.FC<Props> = ({ results }) => {
  const totalWith20 = results.scenario2Total;
  const totalWithout20 = results.scenario2Total - results.indemnification20Days;
  const diff = results.indemnification20Days;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Col 1: Numerical Strategy */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-porta-dark mb-4 flex items-center gap-2">
            <FileText size={20} className="text-porta-accent"/>
            Estrategia Sugerida
        </h3>
        
        <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3">
                Impacto de los <strong>20 días por año</strong> en la negociación del Escenario 2:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Con 20 días/año:</span>
                    <span className="font-semibold text-porta-dark">{formatCurrency(totalWith20)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Sin 20 días/año:</span>
                    <span className="font-semibold text-porta-dark">{formatCurrency(totalWithout20)}</span>
                </div>
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-porta-accent font-medium">Margen de negociación:</span>
                    <span className="font-bold text-porta-accent">{formatCurrency(diff)}</span>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex gap-3">
                <CheckCircle className="text-green-500 shrink-0 mt-1" size={18} />
                <div>
                    <h4 className="text-sm font-semibold text-gray-800">Escenario 1 (Básico)</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Ideal para renuncias voluntarias o separaciones de mutuo acuerdo amistoso. Cumple estrictamente obligaciones devengadas.
                    </p>
                </div>
            </div>
            
            <div className="flex gap-3">
                <CheckCircle className="text-porta-accent shrink-0 mt-1" size={18} />
                <div>
                    <h4 className="text-sm font-semibold text-gray-800">Escenario 2 (Negociado)</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Punto de equilibrio para despido. Se recomienda ofrecer el monto "Sin 20 días" inicialmente y usar la <strong>Carta de Recomendación</strong> como valor agregado no monetario para cerrar el trato. Los 20 días pueden usarse como última reserva.
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Col 2: Risks & Warnings */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
         <div>
            <h3 className="text-lg font-medium text-porta-dark mb-4 flex items-center gap-2">
                <ShieldAlert size={20} className="text-red-500"/>
                Riesgo Legal
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                El <strong>Escenario 3</strong> representa una proyección de costo si el caso escala a juicio laboral y se pierde. 
            </p>
            <ul className="list-disc list-inside text-xs text-gray-500 space-y-2 mb-6">
                <li>Incluye salarios caídos (limitados legalmente, pero costosos en flujo de caja).</li>
                <li>Considera intereses capitalizables.</li>
                <li>Implica gastos adicionales de abogados patronales (no incluidos en esta cifra).</li>
                <li>El tiempo promedio de resolución puede superar los 2 años.</li>
            </ul>
         </div>

         <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
             <p className="text-[10px] text-amber-800 leading-tight text-justify">
                <strong>Nota Legal:</strong> Esta herramienta es solo una estimación orientativa basada en la Ley Federal del Trabajo de México. Los cálculos de SDI, antigüedad y prestaciones pueden variar según interpretaciones judiciales específicas o contratos colectivos. <strong>No constituye asesoría legal vinculante.</strong> Siempre valida las cifras finales con tu departamento legal antes de presentar una propuesta formal.
             </p>
         </div>
      </div>
    </div>
  );
};

export default NegotiationCard;