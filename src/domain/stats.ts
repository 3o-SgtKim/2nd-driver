import type { FuelLog, MaintenanceLog, TireCorrection, Vehicle } from './types';
import { getMaintenanceLabel } from './types';

export function getLastOdometer(state: { fuelLogs: FuelLog[]; maintenanceLogs: MaintenanceLog[] }): number | null {
  const readings = [
    ...state.fuelLogs.map((log) => log.odometer),
    ...state.maintenanceLogs.map((log) => log.odometer),
  ];

  if (readings.length === 0) {
    return null;
  }

  return Math.max(...readings);
}

export function getLatestFuelLog(fuelLogs: FuelLog[]): FuelLog | null {
  if (fuelLogs.length === 0) {
    return null;
  }

  return [...fuelLogs].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) {
      return byDate;
    }
    return b.odometer - a.odometer;
  })[0];
}

/**
 * Calcula a circunferência do pneu em mm a partir de largura/perfil/aro.
 * Circunferência = pi * diâmetro total
 * Diâmetro total = (aro em mm) + 2 * (largura * aspecto / 100)
 */
function tireCircumference(width: number, aspect: number, rimInch: number): number {
  const rimMm = rimInch * 25.4;
  const sidewall = width * (aspect / 100);
  const diameter = rimMm + 2 * sidewall;
  return Math.PI * diameter;
}

/** Fator de correção: odômetro real / odômetro marcado */
export function tireCorrectionFactor(correction: TireCorrection | undefined): number {
  if (!correction) {
    return 1;
  }
  const oldCirc = tireCircumference(
    correction.oldWidth,
    correction.oldAspect,
    correction.oldRim
  );
  const newCirc = tireCircumference(
    correction.newWidth,
    correction.newAspect,
    correction.newRim
  );
  if (oldCirc <= 0) {
    return 1;
  }
  return newCirc / oldCirc;
}

/** Consumo em km/L (ou mi/gal) entre abastecimentos cheios consecutivos, com correção de pneu. */
export function getFuelEconomy(
  fuelLogs: FuelLog[],
  vehicle: Vehicle
): { value: number; unitLabel: string } | null {
  const fullTanks = [...fuelLogs]
    .filter((log) => log.isFullTank)
    .sort((a, b) => a.odometer - b.odometer || a.date.localeCompare(b.date));

  if (fullTanks.length < 2) {
    return null;
  }

  const factor = tireCorrectionFactor(vehicle.tireCorrection);
  let totalVolume = 0;
  let totalDistance = 0;

  for (let i = 1; i < fullTanks.length; i += 1) {
    const prev = fullTanks[i - 1];
    const curr = fullTanks[i];
    const rawDistance = curr.odometer - prev.odometer;
    if (rawDistance <= 0) {
      continue;
    }
    const correctedDistance = rawDistance * factor;
    totalVolume += curr.volume;
    totalDistance += correctedDistance;
  }

  if (totalDistance <= 0 || totalVolume <= 0) {
    return null;
  }

  const value = totalDistance / totalVolume;
  return {
    value,
    unitLabel: vehicle.odometerUnit === 'km' ? 'km/L' : 'mi/gal',
  };
}

export type NextService = {
  log: MaintenanceLog;
  dueLabel: string;
};

export function getNextService(
  maintenanceLogs: MaintenanceLog[],
  lastOdometer: number | null
): NextService | null {
  const today = new Date().toISOString().slice(0, 10);
  const candidates: NextService[] = [];

  for (const log of maintenanceLogs) {
    const dueByOdo =
      log.nextDueOdometer != null &&
      (lastOdometer == null || log.nextDueOdometer > lastOdometer);
    const dueByDate = log.nextDueDate != null && log.nextDueDate >= today;

    if (!dueByOdo && !dueByDate) {
      continue;
    }

    const parts: string[] = [];
    if (log.nextDueOdometer != null) {
      parts.push(formatNumber(log.nextDueOdometer));
    }
    if (log.nextDueDate != null) {
      parts.push(formatDateDisplay(log.nextDueDate));
    }

    candidates.push({
      log,
      dueLabel: parts.join(' · '),
    });
  }

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort((a, b) => {
    const aDate = a.log.nextDueDate ?? '9999-12-31';
    const bDate = b.log.nextDueDate ?? '9999-12-31';
    const byDate = aDate.localeCompare(bDate);
    if (byDate !== 0) {
      return byDate;
    }
    return (a.log.nextDueOdometer ?? Number.MAX_SAFE_INTEGER) -
      (b.log.nextDueOdometer ?? Number.MAX_SAFE_INTEGER);
  })[0];
}

export function getAllNextServices(
  maintenanceLogs: MaintenanceLog[],
  lastOdometer: number | null
): NextService[] {
  const today = new Date().toISOString().slice(0, 10);
  const candidates: NextService[] = [];

  for (const log of maintenanceLogs) {
    const dueByOdo =
      log.nextDueOdometer != null &&
      (lastOdometer == null || log.nextDueOdometer > lastOdometer);
    const dueByDate = log.nextDueDate != null && log.nextDueDate >= today;

    if (!dueByOdo && !dueByDate) {
      continue;
    }

    const parts: string[] = [];
    if (log.nextDueOdometer != null) {
      parts.push(`${formatNumber(log.nextDueOdometer)} km`);
    }
    if (log.nextDueDate != null) {
      parts.push(formatDateDisplay(log.nextDueDate));
    }

    candidates.push({
      log,
      dueLabel: parts.join(' · '),
    });
  }

  return candidates.sort((a, b) => {
    const aDate = a.log.nextDueDate ?? '9999-12-31';
    const bDate = b.log.nextDueDate ?? '9999-12-31';
    return aDate.localeCompare(bDate);
  });
}

export function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency,
  });
}

/** Converte ISO yyyy-mm-dd para exibição dd/mm/aaaa */
export function formatDateDisplay(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

/** Converte dd/mm/aaaa para ISO yyyy-mm-dd. Retorna null se inválido. */
export function parseDateInput(displayDate: string): string | null {
  const parts = displayDate.trim().split('/');
  if (parts.length !== 3) {
    return null;
  }
  const [dd, mm, yyyy] = parts;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  if (!day || !month || !year || day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
    return null;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function todayDisplayDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isoToDisplay(iso: string): string {
  return formatDateDisplay(iso);
}

export function displayToIso(display: string): string | null {
  return parseDateInput(display);
}

/**
 * Given the current odometer and the current date, compute the next due odometer
 * and next due date based on a maintenance schedule entry's interval.
 */
export function computeNextDue(
  currentOdometer: number,
  currentDateIso: string,
  intervalKm?: number,
  intervalMonths?: number,
): { nextOdometer?: number; nextDateIso?: string } {
  const result: { nextOdometer?: number; nextDateIso?: string } = {};
  if (intervalKm != null && intervalKm > 0) {
    result.nextOdometer = currentOdometer + intervalKm;
  }
  if (intervalMonths != null && intervalMonths > 0) {
    const d = new Date(currentDateIso);
    d.setMonth(d.getMonth() + intervalMonths);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    result.nextDateIso = `${y}-${m}-${day}`;
  }
  return result;
}
