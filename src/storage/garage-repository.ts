import AsyncStorage from '@react-native-async-storage/async-storage';

import { EMPTY_GARAGE, type GarageState, type Vehicle } from '@/domain/types';

import { GARAGE_STORAGE_KEY } from './keys';

function migrate(raw: unknown): GarageState {
  if (!raw || typeof raw !== 'object') {
    return EMPTY_GARAGE;
  }

  const data = raw as Record<string, unknown>;

  // v1 → v2: single vehicle → vehicles array
  if (data.version === 1) {
    const vehicle = (data.vehicle as Vehicle | null) ?? null;
    return {
      version: 2,
      vehicles: vehicle ? [vehicle] : [],
      selectedVehicleId: vehicle?.id ?? null,
      fuelLogs: Array.isArray(data.fuelLogs) ? data.fuelLogs : [],
      maintenanceLogs: Array.isArray(data.maintenanceLogs) ? data.maintenanceLogs : [],
    } as GarageState;
  }

  if (data.version === 2) {
    return {
      version: 2,
      vehicles: Array.isArray(data.vehicles) ? data.vehicles : [],
      selectedVehicleId: (data.selectedVehicleId as string) ?? null,
      fuelLogs: Array.isArray(data.fuelLogs) ? data.fuelLogs : [],
      maintenanceLogs: Array.isArray(data.maintenanceLogs) ? data.maintenanceLogs : [],
    };
  }

  return EMPTY_GARAGE;
}

export async function loadGarage(): Promise<GarageState> {
  try {
    const json = await AsyncStorage.getItem(GARAGE_STORAGE_KEY);
    if (!json) {
      return EMPTY_GARAGE;
    }
    return migrate(JSON.parse(json));
  } catch {
    return EMPTY_GARAGE;
  }
}

export async function saveGarage(state: GarageState): Promise<void> {
  await AsyncStorage.setItem(GARAGE_STORAGE_KEY, JSON.stringify(state));
}
