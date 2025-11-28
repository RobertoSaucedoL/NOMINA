import { Collaborator, CalculationResult } from '../types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Factores financieros ajustados a la realidad (Costo Nomina -> Salario)
// Factor Net: 33400 Costo / 20700 Neto = 1.6135
const FACTOR_COST_TO_NET = 1.6135;
// Factor Gross: 33400 Costo / 25000 Bruto = 1.336
const FACTOR_COST_TO_GROSS = 1.336;

// LFT 2024 Table
export const getStatutoryVacationDays = (yearOfService: number): number => {
  if (yearOfService === 1) return 12;
  if (yearOfService === 2) return 14;
  if (yearOfService === 3) return 16;
  if (yearOfService === 4) return 18;
  if (yearOfService === 5) return 20;
  if (yearOfService >= 6 && yearOfService <= 10) return 22;
  if (yearOfService >= 11 && yearOfService <= 15) return 24;
  if (yearOfService >= 16 && yearOfService <= 20) return 26;
  if (yearOfService >= 21 && yearOfService <= 25) return 28;
  if (yearOfService >= 26 && yearOfService <= 30) return 30;
  return 32;
};

export const calculateResults = (data: Collaborator): CalculationResult => {
  // --- 1. NORMALIZACIÓN DE FECHAS (UTC) ---
  const parseDateUTC = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)); 
  };

  const start = parseDateUTC(data.startDate);
  const end = parseDateUTC(data.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return {
      sdi: 0, isSdiManual: false, effectiveDailySalary: 0,
      antiquityYears: 0, antiquityDaysTotal: 0, vacationDaysEntitledCurrentYear: 0, daysWorkedSinceAnniversary: 0,
      unpaidWages: 0, proportionalAguinaldo: 0, effectiveAguinaldoDays: 15, aguinaldoDaysWorked: 0,
      totalVacationDaysEarnedHistory: 0, netVacationDaysToPay: 0, proportionalVacation: 0,
      vacationPremium: 0, seniorityPremium: 0, indemnification3Months: 0, indemnification20Days: 0, lostWages: 0,
      scenario1Total: 0, scenario2Total: 0, scenario2TotalWithout20Days: 0, scenario3Total: 0
    };
  }

  // --- 2. CÁLCULO DE ANTIGÜEDAD ---
  const diffTime = end.getTime() - start.getTime();
  const antiquityDaysTotal = Math.floor(diffTime / MS_PER_DAY) + 1; // +1 to include start date
  const antiquityYearsExact = antiquityDaysTotal / 365;
  const completedYears = Math.floor(antiquityYearsExact);

  // --- 3. DATOS LEGALES BASE ---
  const safeAguinaldoInput = (typeof data.aguinaldoDays === 'number' && !isNaN(data.aguinaldoDays)) ? data.aguinaldoDays : 0;
  const effectiveAguinaldoDays = Math.max(15, safeAguinaldoInput);
  
  const currentCycleEntitlement = getStatutoryVacationDays(completedYears + 1);

  // --- 4. CÁLCULO DE SALARIOS (FINANCIERO VS LEGAL) ---
  let baseSalary = 0; // Se usará para Finiquito (Neto)
  let sdi = 0; // Se usará para Indemnización (Bruto Integrado)
  let isSdiManual = false;

  // Cálculo del Factor de Integración (se necesita para el SDI automático)
  const integrationFactor = 1 + ((effectiveAguinaldoDays + (currentCycleEntitlement * (data.vacationPremiumPkg / 100))) / 365);

  if (data.monthlyPayrollCost && data.monthlyPayrollCost > 0) {
    // Modo "Costo Nómina": Prioridad absoluta
    
    // A) Salario Diario Base (NETO) para Finiquito "Realista"
    // Costo -> Neto -> Diario
    baseSalary = (data.monthlyPayrollCost / FACTOR_COST_TO_NET) / 30;

    // B) SDI (BRUTO INTEGRADO) para Indemnización "Legal"
    // Costo -> Bruto -> Diario Bruto -> SDI
    const grossDaily = (data.monthlyPayrollCost / FACTOR_COST_TO_GROSS) / 30;
    sdi = grossDaily * integrationFactor;
    
    // En este modo, ignoramos manualSdi porque el SDI se deriva del Costo
    isSdiManual = false; 

  } else {
    // Modo Manual: Usa lo que el usuario escribió en los campos de salario
    baseSalary = data.dailySalary || 0;
    
    if (data.manualSdi && data.manualSdi > 0) {
      sdi = data.manualSdi;
      isSdiManual = true;
    } else {
      sdi = baseSalary * integrationFactor;
    }
  }


  // --- 5. AGUINALDO PROPORCIONAL ---
  const currentYear = end.getUTCFullYear();
  const jan1CurrentYear = new Date(Date.UTC(currentYear, 0, 1));
  const aguinaldoStartDate = start > jan1CurrentYear ? start : jan1CurrentYear;
  
  // Días trabajados en el año (inclusivo)
  let aguinaldoDaysWorked = Math.floor((end.getTime() - aguinaldoStartDate.getTime()) / MS_PER_DAY) + 1;
  
  // Corrección estricta: Si trabajó todo el año (365 o 366), aseguramos el tope
  const daysInYear = 365; // LFT standard divisor is 365 regardless of leap year usually, but consistency matters
  if (aguinaldoDaysWorked >= 365) {
     // Si trabajó el año completo (o más), le tocan los días completos de aguinaldo.
     // Esto evita que 365/365 * 15 de 14.9999 o similar por errores de fecha JS.
     aguinaldoDaysWorked = 365;
  }
  if (aguinaldoDaysWorked < 0) aguinaldoDaysWorked = 0;
  
  const propAguinaldo = (effectiveAguinaldoDays / 365) * aguinaldoDaysWorked * baseSalary;


  // --- 6. VACACIONES (Acumuladas Históricas) ---
  let totalVacationDaysEarnedHistory = 0;

  for (let i = 1; i <= completedYears; i++) {
    totalVacationDaysEarnedHistory += getStatutoryVacationDays(i);
  }

  const lastAnniversaryDate = new Date(Date.UTC(start.getUTCFullYear() + completedYears, start.getUTCMonth(), start.getUTCDate()));
  let daysSinceAnniversary = Math.floor((end.getTime() - lastAnniversaryDate.getTime()) / MS_PER_DAY) + 1; 
  
  if (daysSinceAnniversary < 0) daysSinceAnniversary = 0;
  if (daysSinceAnniversary > 366) daysSinceAnniversary = 365; 

  const proportionalDaysCurrentYear = (daysSinceAnniversary / 365) * currentCycleEntitlement;
  totalVacationDaysEarnedHistory += proportionalDaysCurrentYear;

  const netVacationDaysToPay = Math.max(0, totalVacationDaysEarnedHistory - (data.vacationDaysTaken || 0));
  const propVacation = netVacationDaysToPay * baseSalary;


  // --- 7. PRIMA VACACIONAL ---
  const vacPremium = propVacation * (data.vacationPremiumPkg / 100);


  // --- 8. PRIMA DE ANTIGÜEDAD ---
  // Topado a 2 SM. Se calcula sobre el salario base (o el tope).
  const salaryCap = data.minimumWage * 2;
  // Nota: Si usamos Base Neto y es bajo, puede no llegar al tope. Si usamos Bruto sí. 
  // LFT dice "Salario", generalmente se interpreta el cuota diaria. 
  // Usaremos baseSalary (Neto) para ser consistentes con el finiquito de bolsillo, 
  // PERO si el usuario metió Costo, el Bruto es la base legal real.
  // Ajuste de afinación: Para prima de antigüedad usamos la base Bruta si venimos de Costo.
  
  let salaryForPrimaCalculation = baseSalary;
  if (data.monthlyPayrollCost && data.monthlyPayrollCost > 0) {
      salaryForPrimaCalculation = (data.monthlyPayrollCost / FACTOR_COST_TO_GROSS) / 30;
  }
  
  const salaryForPrima = salaryForPrimaCalculation > salaryCap ? salaryCap : salaryForPrimaCalculation;
  const seniorityPremium = antiquityYearsExact * 12 * salaryForPrima;


  // --- 9. INDEMNIZACIONES (Usando SDI) ---
  const indemnification3Months = 90 * sdi;
  const indemnification20Days = antiquityYearsExact * 20 * sdi;


  // --- 10. RIESGO / SALARIOS CAÍDOS (Usando SDI) ---
  const lostWagesBase = 365 * sdi; 
  const interestBase = 15 * 30 * sdi; 
  const interestAmount = interestBase * 0.02 * 12; 
  const lostWages = lostWagesBase + interestAmount;


  // --- TOTALES ---
  const bonuses = data.pendingBonuses || 0;

  const scenario1Total = propAguinaldo + propVacation + vacPremium + seniorityPremium + bonuses;
  const scenario2TotalWithout20Days = scenario1Total + indemnification3Months;
  const scenario2Total = scenario2TotalWithout20Days + indemnification20Days;
  const scenario3Total = scenario2Total + lostWages;

  return {
    sdi,
    isSdiManual,
    effectiveDailySalary: baseSalary, // Exportamos el salario base efectivo (Neto o Manual)
    antiquityYears: antiquityYearsExact,
    antiquityDaysTotal,
    vacationDaysEntitledCurrentYear: currentCycleEntitlement,
    daysWorkedSinceAnniversary: daysSinceAnniversary,
    unpaidWages: 0,
    proportionalAguinaldo: propAguinaldo,
    effectiveAguinaldoDays, 
    aguinaldoDaysWorked,    
    
    totalVacationDaysEarnedHistory,
    netVacationDaysToPay,
    proportionalVacation: propVacation,
    
    vacationPremium: vacPremium,
    seniorityPremium,
    indemnification3Months,
    indemnification20Days,
    lostWages,
    scenario1Total,
    scenario2Total,
    scenario2TotalWithout20Days,
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
