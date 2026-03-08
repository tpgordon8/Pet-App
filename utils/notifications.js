import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleMedicationNotification(medication, petName) {
  // Request permissions first
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permission denied');
    return null;
  }

  // Parse time (HH:MM format)
  const [hours, minutes] = medication.timeOfDay.split(':').map(Number);

  let trigger;

  if (medication.frequency === 'daily') {
    // Daily notification
    trigger = {
      hour: hours,
      minute: minutes,
      repeats: true,
    };
  } else if (medication.frequency === 'twice-daily') {
    // For twice daily, we'll schedule two separate notifications
    // This is the first one
    trigger = {
      hour: hours,
      minute: minutes,
      repeats: true,
    };
  } else if (medication.frequency === 'weekly') {
    // Weekly notification (every 7 days)
    trigger = {
      weekday: 1, // Monday
      hour: hours,
      minute: minutes,
      repeats: true,
    };
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💊 Medication Reminder`,
        body: `Time to give ${petName} their ${medication.name} (${medication.dosage})`,
        data: {
          medicationId: medication.id,
          petId: medication.petId,
          type: 'medication',
        },
        sound: true,
      },
      trigger,
    });

    // If twice-daily, schedule second notification 12 hours later
    let secondNotificationId = null;
    if (medication.frequency === 'twice-daily') {
      const secondHours = (hours + 12) % 24;
      secondNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `💊 Medication Reminder`,
          body: `Time to give ${petName} their ${medication.name} (${medication.dosage})`,
          data: {
            medicationId: medication.id,
            petId: medication.petId,
            type: 'medication',
          },
          sound: true,
        },
        trigger: {
          hour: secondHours,
          minute: minutes,
          repeats: true,
        },
      });
    }

    return {
      notificationId,
      secondNotificationId
    };
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

export async function cancelMedicationNotification(notificationId, secondNotificationId) {
  try {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
    if (secondNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(secondNotificationId);
    }
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
