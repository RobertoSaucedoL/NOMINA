import { Collaborator, CalculationResult } from '../types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

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
      sdi: 0, isSdiManual: false, antiquityYears: 0, antiquityDaysTotal: 0, vacationDaysEntitledCurrentYear: 0, daysWorkedSinceAnniversary: 0,
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
  // LFT: Aguinaldo mínimo 15 días.
  // Validación robusta: Si viene 0, NaN o <15, se fuerza a 15.
  const safeAguinaldoInput = (typeof data.aguinaldoDays === 'number' && !isNaN(data.aguinaldoDays)) ? data.aguinaldoDays : 0;
  const effectiveAguinaldoDays = Math.max(15, safeAguinaldoInput);
  
  // Vacaciones correspondientes al año actual de servicio para Factor de Integración
  const currentCycleEntitlement = getStatutoryVacationDays(completedYears + 1);


  // --- 4. CÁLCULO DE SALARIOS (BASE vs SDI) ---
  // Salario Base: Input del usuario.
  const baseSalary = data.dailySalary || 0;

  // SDI (Salario Diario Integrado):
  // Si el usuario lo capturó manualmente, usamos ese.
  // Si no, lo calculamos con la fórmula LFT: Base * Factor de Integración
  // Factor = 1 + ( (DíasAguinaldo + (DíasVacaciones * %Prima)) / 365 )
  let sdi = 0;
  let isSdiManual = false;

  const integrationFactor = 1 + ((effectiveAguinaldoDays + (currentCycleEntitlement * (data.vacationPremiumPkg / 100))) / 365);
  const calculatedSdi = baseSalary * integrationFactor;

  if (data.manualSdi && data.manualSdi > 0) {
    sdi = data.manualSdi;
    isSdiManual = true;
  } else {
    sdi = calculatedSdi;
  }

  // --- 5. AGUINALDO PROPORCIONAL ---
  // Fórmula LFT: (DíasAguinaldo / 365) * DíasTrabajadosAño * SalarioBase
  // 1. Determinar inicio del periodo de aguinaldo (1 Ene o Fecha Ingreso)
  const currentYear = end.getUTCFullYear();
  const jan1CurrentYear = new Date(Date.UTC(currentYear, 0, 1));
  const aguinaldoStartDate = start > jan1CurrentYear ? start : jan1CurrentYear;
  
  // 2. Días trabajados en el año calendario (Inclusive +1)
  let aguinaldoDaysWorked = Math.floor((end.getTime() - aguinaldoStartDate.getTime()) / MS_PER_DAY) + 1;
  // Safety cap: cannot exceed 365 (or 366 in leap)
  if (aguinaldoDaysWorked > 366) aguinaldoDaysWorked = 365; 
  if (aguinaldoDaysWorked < 0) aguinaldoDaysWorked = 0;
  
  // 3. Cálculo
  // Nota: Si trabajó todo el año (365 días), (365/365)*15 = 15 días completos.
  const propAguinaldo = (effectiveAguinaldoDays / 365) * aguinaldoDaysWorked * baseSalary;


  // --- 6. VACACIONES (Acumuladas Históricas) ---
  // Fórmula: (DíasGanadosTotales - DíasDisfrutados) * SalarioBase
  
  let totalVacationDaysEarnedHistory = 0;

  // A) Años Completos Anteriores
  for (let i = 1; i <= completedYears; i++) {
    totalVacationDaysEarnedHistory += getStatutoryVacationDays(i);
  }

  // B) Año Trunco (Proporcional)
  const lastAnniversaryDate = new Date(Date.UTC(start.getUTCFullYear() + completedYears, start.getUTCMonth(), start.getUTCDate()));
  let daysSinceAnniversary = Math.floor((end.getTime() - lastAnniversaryDate.getTime()) / MS_PER_DAY) + 1; // +1 Inclusive
  
  if (daysSinceAnniversary < 0) daysSinceAnniversary = 0;
  // Cap at 365 to avoid overflow in leap year logic slightly
  if (daysSinceAnniversary > 366) daysSinceAnniversary = 365; 

  const proportionalDaysCurrentYear = (daysSinceAnniversary / 365) * currentCycleEntitlement;
  totalVacationDaysEarnedHistory += proportionalDaysCurrentYear;

  // C) Netos a Pagar
  const netVacationDaysToPay = Math.max(0, totalVacationDaysEarnedHistory - (data.vacationDaysTaken || 0));

  // D) Dinero (Siempre sobre Salario Base)
  const propVacation = netVacationDaysToPay * baseSalary;


  // --- 7. PRIMA VACACIONAL ---
  // (DineroVacaciones * %Prima)
  const vacPremium = propVacation * (data.vacationPremiumPkg / 100);


  // --- 8. PRIMA DE ANTIGÜEDAD ---
  // 12 días por año de servicio.
  // Base: Salario Diario, TOPADO a 2 veces el Salario Mínimo.
  // Aplica siempre en despido injustificado (Esc 2 y 3).
  // En finiquito (Esc 1), si es renuncia, requiere 15 años. Pero aquí calculamos el monto "devengado" genérico.
  
  const salaryCap = data.minimumWage * 2;
  const salaryForPrima = baseSalary > salaryCap ? salaryCap : baseSalary;
  
  // Fórmula: (AñosExactos * 12) * SalarioTopado
  const seniorityPremium = antiquityYearsExact * 12 * salaryForPrima;


  // --- 9. INDEMNIZACIONES (Usando SDI) ---
  // Constitucional: 3 Meses (90 días) de SDI
  const indemnification3Months = 90 * sdi;
  
  // 20 Días por año (si aplica, Esc 2 y 3) de SDI
  const indemnification20Days = antiquityYearsExact * 20 * sdi;


  // --- 10. RIESGO / SALARIOS CAÍDOS (Usando SDI) ---
  // Estimación LFT Art 48: 12 meses de salarios caídos + Intereses.
  // Nota: Usamos SDI para ser conservadores en el riesgo ("Salarios Vencidos").
  // Intereses: 2% mensual sobre 15 meses de salario (límite legal para base de intereses).
  const lostWagesBase = 365 * sdi; // 1 año aprox
  const interestBase = 15 * 30 * sdi; // 15 meses
  const interestAmount = interestBase * 0.02 * 12; // 2% mensual por 12 meses (estimado juicio largo)
  const lostWages = lostWagesBase + interestAmount;


  // --- TOTALES ---
  const bonuses = data.pendingBonuses || 0;

  // Escenario 1: Derechos Adquiridos (Finiquito)
  // Todo con Salario Base (excepto Prima Antigüedad que tiene su tope propio)
  const scenario1Total = propAguinaldo + propVacation + vacPremium + seniorityPremium + bonuses;
  
  // Escenario 2: Negociación (Despido Injustificado)
  // Suma Escenario 1 + Indemnizaciones (SDI)
  const scenario2TotalWithout20Days = scenario1Total + indemnification3Months;
  const scenario2Total = scenario2TotalWithout20Days + indemnification20Days;

  // Escenario 3: Demanda
  // Suma Escenario 2 + Salarios Caídos (SDI)
  const scenario3Total = scenario2Total + lostWages;

  return {
    sdi,
    isSdiManual,
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