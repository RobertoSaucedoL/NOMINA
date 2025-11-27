import React from 'react';
import { CalculationResult } from '../types';
import { formatCurrency } from '../utils/calculations';

interface Props {
  results: CalculationResult;
}

const ResultsTable: React.FC<Props> = ({ results }) => {
  const Row = ({ label, s1, s2, s3, bold = false, borderTop = false }: { label: string, s1?: number, s2?: number, s3?: number, bold?: boolean, borderTop?: boolean }) => (
    <tr className={`${borderTop ? 'border-t-2 border-gray-100' : 'border-b border-gray-50'} hover:bg-gray-50 transition-colors`}>
      <td className={`p-4 text-sm ${bold ? 'font-semibold text-porta-dark' : 'text-gray-600'}`}>{label}</td>
      <td className={`p-4 text-sm text-right ${bold ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{s1 !== undefined ? formatCurrency(s1) : '-'}</td>
      <td className={`p-4 text-sm text-right ${bold ? 'font-semibold text-porta-accent' : 'text-gray-600'} bg-orange-50/30`}>{s2 !== undefined ? formatCurrency(s2) : '-'}</td>
      <td className={`p-4 text-sm text-right ${bold ? 'font-semibold text-red-600' : 'text-gray-600'} bg-red-50/30`}>{s3 !== undefined ? formatCurrency(s3) : '-'}</td>
    </tr>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h2 className="text-xl font-medium text-porta-dark">Análisis de Escenarios</h2>
        <p className="text-sm text-gray-500 mt-1">Comparativa de costos según LFT</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-white text-left">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/4">Concepto</th>
              <th className="p-4 text-xs font-bold text-gray-600 uppercase tracking-wider w-1/4">
                Escenario 1
                <span className="block text-[10px] font-normal text-gray-400 capitalize">Finiquito de Ley</span>
              </th>
              <th className="p-4 text-xs font-bold text-porta-accent uppercase tracking-wider w-1/4 bg-orange-50/30">
                Escenario 2
                <span className="block text-[10px] font-normal text-porta-accent/70 capitalize">Negociación</span>
              </th>
              <th className="p-4 text-xs font-bold text-red-500 uppercase tracking-wider w-1/4 bg-red-50/30">
                Escenario 3
                <span className="block text-[10px] font-normal text-red-400 capitalize">Riesgo Demanda</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Finiquito Parts */}
            <Row label="Aguinaldo Proporcional" s1={results.proportionalAguinaldo} s2={results.proportionalAguinaldo} s3={results.proportionalAguinaldo} />
            <Row label="Vacaciones (+ No gozadas)" s1={results.proportionalVacation} s2={results.proportionalVacation} s3={results.proportionalVacation} />
            <Row label="Prima Vacacional" s1={results.vacationPremium} s2={results.vacationPremium} s3={results.vacationPremium} />
            <Row label="Prima de Antigüedad" s1={results.seniorityPremium} s2={results.seniorityPremium} s3={results.seniorityPremium} />
            <Row label="Bonos Pendientes" s1={results.scenario1Total - (results.proportionalAguinaldo + results.proportionalVacation + results.vacationPremium + results.seniorityPremium)} s2={results.scenario1Total - (results.proportionalAguinaldo + results.proportionalVacation + results.vacationPremium + results.seniorityPremium)} s3={results.scenario1Total - (results.proportionalAguinaldo + results.proportionalVacation + results.vacationPremium + results.seniorityPremium)} />
            
            {/* Indemnification */}
            <Row label="Indemnización (3 meses)" s2={results.indemnification3Months} s3={results.indemnification3Months} />
            <Row label="20 Días por Año" s2={results.indemnification20Days} s3={results.indemnification20Days} />
            
            {/* Lawsuit Extras */}
            <Row label="Salarios Caídos (Est. 12m)" s3={results.lostWages} />
            
            {/* Totals */}
            <Row 
              label="Total Estimado" 
              s1={results.scenario1Total} 
              s2={results.scenario2Total} 
              s3={results.scenario3Total} 
              bold 
              borderTop 
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;