export interface Collaborator {
  id: string;
  name: string;
  dailySalary: number;
  startDate: string;
  endDate: string;
  aguinaldoDays: number;
  vacationPremiumPkg: number; // Percentage 0-100
  minimumWage: number;
  unpaidVacationDays: number;
  pendingBonuses: number;
  additionalBenefits: string;
}

export interface CalculationResult {
  sdi: number;
  antiquityYears: number;
  antiquityDaysTotal: number;
  vacationDaysEntitled: number;
  
  // Breakdown
  unpaidWages: number; // Salario pendiente (assumed 0 inputs for now, but placeholder logic)
  proportionalAguinaldo: number;
  proportionalVacation: number;
  vacationPremium: number;
  seniorityPremium: number; // Prima antigüedad
  
  indemnification3Months: number;
  indemnification20Days: number;
  lostWages: number; // Salarios caídos (estimate)
  
  // Totals
  scenario1Total: number;
  scenario2Total: number;
  scenario3Total: number;
}

export const DEFAULT_COLLABORATOR: Collaborator = {
  id: '1',
  name: 'Nuevo Colaborador',
  dailySalary: 0,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  aguinaldoDays: 15,
  vacationPremiumPkg: 25,
  minimumWage: 248.93, // 2024 General
  unpaidVacationDays: 0,
  pendingBonuses: 0,
  additionalBenefits: '',
};