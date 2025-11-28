export interface Collaborator {
  id: string;
  name: string;
  monthlyPayrollCost?: number; // Campo principal para captura financiera
  dailySalary: number;
  manualSdi?: number; // Opcional, aunque ahora se calcula auto
  startDate: string;
  endDate: string;
  aguinaldoDays: number;
  vacationPremiumPkg: number; // Porcentaje 0-100
  minimumWage: number;
  vacationDaysTaken: number; // Días disfrutados
  pendingBonuses: number;
  additionalBenefits: string;
}

export interface CalculationResult {
  sdi: number;
  isSdiManual: boolean;
  antiquityYears: number;
  antiquityDaysTotal: number;
  vacationDaysEntitledCurrentYear: number;
  daysWorkedSinceAnniversary: number;
  
  // Breakdown
  unpaidWages: number; 
  proportionalAguinaldo: number;
  effectiveAguinaldoDays: number;
  aguinaldoDaysWorked: number;
  
  // Vacations Breakdown
  totalVacationDaysEarnedHistory: number;
  netVacationDaysToPay: number;
  proportionalVacation: number;
  
  vacationPremium: number;
  seniorityPremium: number; 
  
  indemnification3Months: number;
  indemnification20Days: number;
  lostWages: number; 
  
  // Totals
  scenario1Total: number;
  scenario2Total: number;
  scenario2TotalWithout20Days: number;
  scenario3Total: number;
}

export const DEFAULT_COLLABORATOR: Collaborator = {
  id: '1',
  name: 'Nuevo Colaborador',
  monthlyPayrollCost: 0,
  dailySalary: 0,
  manualSdi: 0,
  startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0], // Default 1 year ago
  endDate: new Date().toISOString().split('T')[0],
  aguinaldoDays: 15,
  vacationPremiumPkg: 25,
  minimumWage: 248.93, // 2024 General
  vacationDaysTaken: 0,
  pendingBonuses: 0,
  additionalBenefits: '',
};
