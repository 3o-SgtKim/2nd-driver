export type OdometerUnit = 'km' | 'mi';
export type FuelUnit = 'L' | 'gal';

export type FuelType = 'gasoline' | 'ethanol' | 'diesel' | 'gnv';

export type MaintenanceGroup =
  | 'engine_filters'
  | 'brakes'
  | 'wheels_suspension'
  | 'electrical_visibility'
  | 'transmission_other'
  | 'other';

export type MaintenanceItem = {
  id: string;
  label: string;
  group: MaintenanceGroup;
};

export const MAINTENANCE_GROUP_LABELS: Record<MaintenanceGroup, string> = {
  engine_filters: 'Motor e Filtros',
  brakes: 'Freios',
  wheels_suspension: 'Rodagem e Suspensão',
  electrical_visibility: 'Elétrica e Visibilidade',
  transmission_other: 'Transmissão e Outros Sistemas',
  other: 'Outro',
};

export const MAINTENANCE_ITEMS: MaintenanceItem[] = [
  // Motor e Filtros
  { id: 'oil_change', label: 'Troca de óleo do motor', group: 'engine_filters' },
  { id: 'oil_filter', label: 'Troca do filtro de óleo', group: 'engine_filters' },
  { id: 'air_filter', label: 'Troca do filtro de ar do motor', group: 'engine_filters' },
  { id: 'fuel_filter', label: 'Troca do filtro de combustível', group: 'engine_filters' },
  { id: 'cabin_filter', label: 'Substituição do filtro de cabine (A/C)', group: 'engine_filters' },
  { id: 'spark_plugs', label: 'Troca das velas de ignição e cabos', group: 'engine_filters' },
  { id: 'coolant', label: 'Substituição do fluido de arrefecimento', group: 'engine_filters' },
  { id: 'timing_belt', label: 'Correia dentada / corrente de comando', group: 'engine_filters' },
  { id: 'throttle_body', label: 'Limpeza do corpo de borboleta (TBI)', group: 'engine_filters' },

  // Freios
  { id: 'brake_pads', label: 'Troca das pastilhas de freio', group: 'brakes' },
  { id: 'brake_discs', label: 'Substituição ou retífica dos discos de freio', group: 'brakes' },
  { id: 'brake_fluid', label: 'Troca do fluido de freio', group: 'brakes' },
  { id: 'rear_drums', label: 'Revisão ou troca de lonas e tambores traseiros', group: 'brakes' },

  // Rodagem e Suspensão
  { id: 'tire_change', label: 'Troca de pneus', group: 'wheels_suspension' },
  { id: 'alignment', label: 'Alinhamento e balanceamento', group: 'wheels_suspension' },
  { id: 'tire_rotation', label: 'Rodízio de pneus', group: 'wheels_suspension' },
  { id: 'shocks', label: 'Troca de amortecedores, coxins e batentes', group: 'wheels_suspension' },
  { id: 'suspension_parts', label: 'Buchas, bieletas e pivôs da suspensão', group: 'wheels_suspension' },

  // Elétrica e Visibilidade
  { id: 'battery', label: 'Substituição da bateria', group: 'electrical_visibility' },
  { id: 'wipers', label: 'Troca das palhetas do limpador', group: 'electrical_visibility' },
  { id: 'bulbs', label: 'Substituição de lâmpadas', group: 'electrical_visibility' },
  { id: 'washer_fluid', label: 'Reservatório do lavador de para-brisa', group: 'electrical_visibility' },

  // Transmissão e Outros Sistemas
  { id: 'gearbox_oil', label: 'Troca do óleo da caixa de câmbio', group: 'transmission_other' },
  { id: 'power_steering', label: 'Troca do fluido da direção hidráulica', group: 'transmission_other' },
  { id: 'ac_cleaning', label: 'Higienização do A/C', group: 'transmission_other' },
  { id: 'leak_inspection', label: 'Inspeção de vazamentos', group: 'transmission_other' },

  // Outro
  { id: 'other', label: 'Outro', group: 'other' },
];

export const MAINTENANCE_GROUPS: MaintenanceGroup[] = [
  'engine_filters',
  'brakes',
  'wheels_suspension',
  'electrical_visibility',
  'transmission_other',
  'other',
];

export function getMaintenanceItemById(id: string): MaintenanceItem | undefined {
  return MAINTENANCE_ITEMS.find((item) => item.id === id);
}

export function getMaintenanceLabel(itemId: string, customTitle?: string): string {
  if (itemId === 'other' && customTitle) {
    return customTitle;
  }
  const item = getMaintenanceItemById(itemId);
  return item?.label ?? customTitle ?? itemId;
}

export type MaintenanceScheduleEntry = {
  maintenanceItemId: string;
  intervalKm?: number;
  intervalMonths?: number;
};

export type Vehicle = {
  id: string;
  name?: string;
  make?: string;
  model?: string;
  year?: number;
  odometerUnit: OdometerUnit;
  fuelUnit: FuelUnit;
  currency: string;
  tireCorrection?: TireCorrection;
  maintenanceSchedule?: MaintenanceScheduleEntry[];
  photoUri?: string;
};

export function getVehicleDisplayName(v: Vehicle): string {
  const parts = [v.make, v.model, v.year].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  return v.name || 'Veículo sem nome';
}

export type TireCorrection = {
  oldWidth: number;
  oldAspect: number;
  oldRim: number;
  newWidth: number;
  newAspect: number;
  newRim: number;
};

export type FuelLog = {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  volume: number;
  totalCost: number;
  isFullTank: boolean;
  fuelType: FuelType;
  notes?: string;
};

export type MaintenanceLog = {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  maintenanceItemId: string;
  customTitle?: string;
  cost?: number;
  nextDueOdometer?: number;
  nextDueDate?: string;
  notes?: string;
  reminderEnabled?: boolean;
};

export type GarageState = {
  version: 2;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  fuelLogs: FuelLog[];
  maintenanceLogs: MaintenanceLog[];
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  gasoline: 'Gasolina',
  ethanol: 'Etanol',
  diesel: 'Diesel',
  gnv: 'GNV',
};

export const EMPTY_GARAGE: GarageState = {
  version: 2,
  vehicles: [],
  selectedVehicleId: null,
  fuelLogs: [],
  maintenanceLogs: [],
};
