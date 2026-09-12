import type { MaintenanceLog } from '@/domain/types';

/** Web has no OS notifications. Native implementation lives in notifications.ts. */

export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function scheduleMaintenanceReminder(_log: MaintenanceLog): Promise<void> {}

export async function cancelMaintenanceReminder(_logId: string): Promise<void> {}

export async function checkOdometerReminders(
  _maintenanceLogs: MaintenanceLog[],
  _currentOdometer: number
): Promise<void> {}
