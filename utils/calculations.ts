import { Collaborator, CalculationResult } from '../types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// LFT 2024 Table
export const getStatutoryVacationDays = (years: number): number => {
  if (years < 1) return 12; // Proportional base
  if (years === 1) return 12;
  if (years === 2) return 14;
  if (years === 3) return 16;
  if (years === 4) return 18;
  if (years >= 5 && years < 10) return 20;
  if (years >= 10 && years < 15) return 22;
  if (years >= 15 && years < 20) return 24;
  if (years >= 20 && years < 25) return 26;
  if (years >= 25 && years < 30) return 28;
  return 30; // 30+ years
};

export const calculateResults = (data: Collaborator): CalculationResult => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  
  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return {
      sdi: 0, antiquityYears: 0, antiquityDaysTotal: 0, vacationDaysEntitled: 0,
      unpaidWages: 0, proportionalAguinaldo: 0, proportionalVacation: 0, vacationPremium: 0,
      seniorityPremium: 0, indemnification3Months: 0, indemnification20Days: 0, lostWages: 0,
      scenario1Total: 0, scenario2Total: 0, scenario3Total: 0
    };
  }

  // Antiquity
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const antiquityDaysTotal = Math.ceil(diffTime / MS_PER_DAY);
  const antiquityYears = antiquityDaysTotal / 365;
  const currentYearDays = antiquityDaysTotal % 365;

  // Vacation Days based on full years
  const vacationDaysEntitled = getStatutoryVacationDays(Math.floor(antiquityYears));

  // SDI Calculation (Integration Factor)
  // Factor = 1 + ( (DaysAguinaldo + (DaysVacation * Premium%)) / 365 )
  const yearlyVacationDays = getStatutoryVacationDays(Math.floor(antiquityYears) + 1); // Use current accruing year for integration
  const factor = 1 + ((data.aguinaldoDays + (yearlyVacationDays * (data.vacationPremiumPkg / 100))) / 365);
  const sdi = data.dailySalary * factor;

  // --- Scenario 1: Finiquito (Proportionals) ---
  
  // 1. Proportional Aguinaldo
  // (Days worked in current year / 365) * Aguinaldo Days * Daily Salary
  // For simplicity, we use the days fraction of the last year worked.
  // Note: This assumes calendar year logic for aguinaldo usually, but strictly purely proportional to time worked in the cycle is often used for calculators. 
  // We will use the days elapsed in the "current cycle" roughly equivalent to days worked in last year for calculation ease, 
  // or more accurately, (DaysAguinaldo / 365) * DaysWorkedTotal * DailySalary? No, Aguinaldo resets yearly.
  // We will assume 365 days base for proportion of the last year.
  // A robust calc usually asks "Days worked in current year". We will estimate based on antiquity modulo.
  const propAguinaldo = (data.aguinaldoDays / 365) * currentYearDays * data.dailySalary;

  // 2. Proportional Vacation
  // (Vacation Days for current level / 365) * Days worked since anniversary * Daily Salary
  const propVacation = (vacationDaysEntitled / 365) * currentYearDays * data.dailySalary;
  
  // 3. Vacation Premium
  const vacPremium = propVacation * (data.vacationPremiumPkg / 100);

  // 4. Vacation Not Taken (Inputs)
  const unpaidVacationVal = data.unpaidVacationDays * data.dailySalary;
  const unpaidVacationPremVal = unpaidVacationVal * (data.vacationPremiumPkg / 100);

  // 5. Seniority Premium (Prima de Antigüedad)
  // 12 days per year of service. Top Salary cap = 2 * Minimum Wage.
  const topSalaryPrima = data.minimumWage * 2;
  const salaryForPrima = data.dailySalary > topSalaryPrima ? topSalaryPrima : data.dailySalary;
  // It applies fully for years worked + proportional for fraction of year
  const seniorityPremium = (12 * antiquityYears) * salaryForPrima;

  // Pending Bonuses (Direct add)
  const bonuses = data.pendingBonuses;

  // Scenario 1 Sum
  const scenario1Total = propAguinaldo + propVacation + vacPremium + seniorityPremium + unpaidVacationVal + unpaidVacationPremVal + bonuses;

  // --- Scenario 2: Negotiated (Dismissal) ---
  
  // 1. Indemnification 3 Months (Constitutional) -> Uses SDI
  const indemnification3Months = 90 * sdi;

  // 2. 20 Days per Year -> Uses SDI
  const indemnification20Days = (20 * antiquityYears) * sdi;

  // Scenario 2 Sum (Scenario 1 + Indemnification + 20 Days)
  const scenario2Total = scenario1Total + indemnification3Months + indemnification20Days;

  // --- Scenario 3: Lawsuit Risk ---
  
  // 1. Lost Wages (Salarios Caídos)
  // LFT limits to 12 months capped + interests.
  // We will estimate 12 months of full SDI as a "Maximum Risk" baseline + interest estimate (2%).
  // This is a rough estimation for risk visualization.
  const lostWages = (365 * sdi) + ((15 * 12 * sdi) * 0.02); // 12 months + roughly 2% interest calc placeholder

  const scenario3Total = scenario2Total + lostWages;

  return {
    sdi,
    antiquityYears,
    antiquityDaysTotal,
    vacationDaysEntitled,
    unpaidWages: 0, // Placeholder
    proportionalAguinaldo: propAguinaldo,
    proportionalVacation: propVacation + unpaidVacationVal,
    vacationPremium: vacPremium + unpaidVacationPremVal,
    seniorityPremium,
    indemnification3Months,
    indemnification20Days,
    lostWages,
    scenario1Total,
    scenario2Total,
    scenario3Total
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatYears = (val: number) => {
  const years = Math.floor(val);
  const days = Math.floor((val - years) * 365);
  return `${years} años, ${days} días`;
};
