import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { createId } from '@/domain/ids';
import {
  cancelMaintenanceReminder,
  checkOdometerReminders,
  scheduleMaintenanceReminder,
} from '@/domain/notifications';
import {
  EMPTY_GARAGE,
  type FuelLog,
  type GarageState,
  type MaintenanceLog,
  type Vehicle,
} from '@/domain/types';
import { loadGarage, saveGarage } from '@/storage/garage-repository';
import { deleteVehiclePhoto } from '@/storage/vehicle-photo';

type VehicleInput = Omit<Vehicle, 'id'> & { id?: string };
type FuelInput = Omit<FuelLog, 'id' | 'vehicleId'> & { id?: string };
type MaintenanceInput = Omit<MaintenanceLog, 'id' | 'vehicleId'> & { id?: string };

type GarageContextValue = {
  /** Raw state */
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  /** Currently selected vehicle (convenience) */
  vehicle: Vehicle | null;
  /** Logs filtered by selected vehicle */
  fuelLogs: FuelLog[];
  maintenanceLogs: MaintenanceLog[];

  loading: boolean;
  error: string | null;

  /** Vehicle CRUD */
  addVehicle: (input: VehicleInput) => Promise<Vehicle>;
  updateVehicle: (input: VehicleInput & { id: string }) => Promise<Vehicle>;
  deleteVehicle: (id: string) => Promise<void>;
  selectVehicle: (id: string) => Promise<void>;

  /** Fuel CRUD */
  addFuelLog: (input: FuelInput) => Promise<FuelLog>;
  updateFuelLog: (input: FuelInput & { id: string }) => Promise<FuelLog>;
  deleteFuelLog: (id: string) => Promise<void>;

  /** Maintenance CRUD */
  addMaintenanceLog: (input: MaintenanceInput) => Promise<MaintenanceLog>;
  updateMaintenanceLog: (input: MaintenanceInput & { id: string }) => Promise<MaintenanceLog>;
  deleteMaintenanceLog: (id: string) => Promise<void>;
};

const GarageContext = createContext<GarageContextValue | null>(null);

export function GarageProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GarageState>(EMPTY_GARAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const loaded = await loadGarage();
        if (active) setState(loaded);
      } catch {
        if (active) setError('Não foi possível carregar os dados.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const persist = useCallback(async (next: GarageState) => {
    setState(next);
    try {
      await saveGarage(next);
      setError(null);
    } catch {
      setError('Não foi possível salvar os dados.');
    }
  }, []);

  // Derived: current vehicle
  const vehicle = useMemo(
    () => state.vehicles.find((v) => v.id === state.selectedVehicleId) ?? null,
    [state.vehicles, state.selectedVehicleId]
  );

  // Derived: logs filtered by selected vehicle
  const fuelLogs = useMemo(
    () => (vehicle ? state.fuelLogs.filter((l) => l.vehicleId === vehicle.id) : []),
    [state.fuelLogs, vehicle]
  );
  const maintenanceLogs = useMemo(
    () => (vehicle ? state.maintenanceLogs.filter((l) => l.vehicleId === vehicle.id) : []),
    [state.maintenanceLogs, vehicle]
  );

  // ── Vehicle CRUD ──

  const addVehicle = useCallback(
    async (input: VehicleInput) => {
      const v: Vehicle = { ...input, id: input.id ?? createId('veh') };
      await persist({
        ...state,
        vehicles: [...state.vehicles, v],
        selectedVehicleId: v.id,
      });
      return v;
    },
    [persist, state]
  );

  const updateVehicle = useCallback(
    async (input: VehicleInput & { id: string }) => {
      const v: Vehicle = { ...input };
      await persist({
        ...state,
        vehicles: state.vehicles.map((old) => (old.id === v.id ? { ...old, ...v } : old)),
      });
      return v;
    },
    [persist, state]
  );

  const deleteVehicle = useCallback(
    async (id: string) => {
      const doomed = state.vehicles.find((v) => v.id === id);
      await deleteVehiclePhoto(doomed?.photoUri);
      const remaining = state.vehicles.filter((v) => v.id !== id);
      const newSelected =
        state.selectedVehicleId === id
          ? remaining[0]?.id ?? null
          : state.selectedVehicleId;
      // Also remove logs for this vehicle
      await persist({
        ...state,
        vehicles: remaining,
        selectedVehicleId: newSelected,
        fuelLogs: state.fuelLogs.filter((l) => l.vehicleId !== id),
        maintenanceLogs: state.maintenanceLogs.filter((l) => l.vehicleId !== id),
      });
    },
    [persist, state]
  );

  const selectVehicle = useCallback(
    async (id: string) => {
      await persist({ ...state, selectedVehicleId: id });
    },
    [persist, state]
  );

  // ── Fuel CRUD ──

  const addFuelLog = useCallback(
    async (input: FuelInput) => {
      if (!vehicle) throw new Error('Cadastre um veículo primeiro.');
      const log: FuelLog = { ...input, id: createId('fuel'), vehicleId: vehicle.id };
      const next = { ...state, fuelLogs: [log, ...state.fuelLogs] };
      await persist(next);
      checkOdometerReminders(
        next.maintenanceLogs.filter((l) => l.vehicleId === vehicle.id),
        log.odometer
      ).catch(() => {});
      return log;
    },
    [persist, state, vehicle]
  );

  const updateFuelLog = useCallback(
    async (input: FuelInput & { id: string }) => {
      if (!vehicle) throw new Error('Cadastre um veículo primeiro.');
      const log: FuelLog = { ...input, vehicleId: vehicle.id };
      await persist({
        ...state,
        fuelLogs: state.fuelLogs.map((item) => (item.id === log.id ? log : item)),
      });
      return log;
    },
    [persist, state, vehicle]
  );

  const deleteFuelLog = useCallback(
    async (id: string) => {
      await persist({
        ...state,
        fuelLogs: state.fuelLogs.filter((item) => item.id !== id),
      });
    },
    [persist, state]
  );

  // ── Maintenance CRUD ──

  const addMaintenanceLog = useCallback(
    async (input: MaintenanceInput) => {
      if (!vehicle) throw new Error('Cadastre um veículo primeiro.');
      const log: MaintenanceLog = { ...input, id: createId('mnt'), vehicleId: vehicle.id };
      await persist({
        ...state,
        maintenanceLogs: [log, ...state.maintenanceLogs],
      });
      if (log.reminderEnabled) {
        scheduleMaintenanceReminder(log).catch(() => {});
      }
      return log;
    },
    [persist, state, vehicle]
  );

  const updateMaintenanceLog = useCallback(
    async (input: MaintenanceInput & { id: string }) => {
      if (!vehicle) throw new Error('Cadastre um veículo primeiro.');
      const log: MaintenanceLog = { ...input, vehicleId: vehicle.id };
      await persist({
        ...state,
        maintenanceLogs: state.maintenanceLogs.map((item) =>
          item.id === log.id ? log : item
        ),
      });
      if (log.reminderEnabled) {
        scheduleMaintenanceReminder(log).catch(() => {});
      } else {
        cancelMaintenanceReminder(log.id).catch(() => {});
      }
      return log;
    },
    [persist, state, vehicle]
  );

  const deleteMaintenanceLog = useCallback(
    async (id: string) => {
      cancelMaintenanceReminder(id).catch(() => {});
      await persist({
        ...state,
        maintenanceLogs: state.maintenanceLogs.filter((item) => item.id !== id),
      });
    },
    [persist, state]
  );

  const value = useMemo(
    () => ({
      vehicles: state.vehicles,
      selectedVehicleId: state.selectedVehicleId,
      vehicle,
      fuelLogs,
      maintenanceLogs,
      loading,
      error,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      selectVehicle,
      addFuelLog,
      updateFuelLog,
      deleteFuelLog,
      addMaintenanceLog,
      updateMaintenanceLog,
      deleteMaintenanceLog,
    }),
    [
      state.vehicles,
      state.selectedVehicleId,
      vehicle,
      fuelLogs,
      maintenanceLogs,
      loading,
      error,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      selectVehicle,
      addFuelLog,
      updateFuelLog,
      deleteFuelLog,
      addMaintenanceLog,
      updateMaintenanceLog,
      deleteMaintenanceLog,
    ]
  );

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>;
}

export function useGarage() {
  const context = useContext(GarageContext);
  if (!context) {
    throw new Error('useGarage deve ser usado dentro de GarageProvider.');
  }
  return context;
}
