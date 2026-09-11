import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getMaintenanceLabel, type MaintenanceLog } from '@/domain/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Agenda notificações para uma manutenção:
 * - Por data: notifica no dia definido em nextDueDate às 9h
 * - Por odômetro: não é possível agendar por odômetro via push,
 *   mas checkOdometerReminders() verifica a cada abastecimento
 */
export async function scheduleMaintenanceReminder(log: MaintenanceLog): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  // Cancela notificações anteriores desse registro
  await cancelMaintenanceReminder(log.id);

  const title = getMaintenanceLabel(log.maintenanceItemId, log.customTitle);

  // Agendar por data
  if (log.nextDueDate) {
    const [year, month, day] = log.nextDueDate.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day, 9, 0, 0);

    // Só agenda se a data for no futuro
    if (dueDate.getTime() > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        identifier: `mnt-date-${log.id}`,
        content: {
          title: '🔧 Manutenção pendente',
          body: `${title} está programada para hoje.`,
          data: { logId: log.id, type: 'maintenance-date' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dueDate,
        },
      });
    }

    // Notificação de aviso 3 dias antes
    const warningDate = new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    if (warningDate.getTime() > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        identifier: `mnt-warn-${log.id}`,
        content: {
          title: '🔧 Manutenção em breve',
          body: `${title} está programada para daqui a 3 dias.`,
          data: { logId: log.id, type: 'maintenance-warning' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: warningDate,
        },
      });
    }
  }

  // Odômetro: verificado em tempo real via checkOdometerReminders() a cada abastecimento
}

export async function cancelMaintenanceReminder(logId: string): Promise<void> {
  const prefixes = [`mnt-date-${logId}`, `mnt-warn-${logId}`, `mnt-odo-alert-${logId}`];
  for (const id of prefixes) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // Ignora se não existir
    }
  }
}

/**
 * Verifica se alguma manutenção ultrapassou o odômetro definido.
 * Chamada a cada novo abastecimento.
 */
export async function checkOdometerReminders(
  maintenanceLogs: MaintenanceLog[],
  currentOdometer: number
): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  for (const log of maintenanceLogs) {
    if (
      log.reminderEnabled &&
      log.nextDueOdometer != null &&
      currentOdometer >= log.nextDueOdometer
    ) {
      const title = getMaintenanceLabel(log.maintenanceItemId, log.customTitle);

      await Notifications.scheduleNotificationAsync({
        identifier: `mnt-odo-alert-${log.id}`,
        content: {
          title: '⚠️ Manutenção atingida!',
          body: `${title} deveria ser feita em ${log.nextDueOdometer.toLocaleString('pt-BR')} km. Seu odômetro atual: ${currentOdometer.toLocaleString('pt-BR')} km.`,
          data: { logId: log.id, type: 'maintenance-odometer-reached' },
        },
        trigger: null,
      });
    }
  }
}
