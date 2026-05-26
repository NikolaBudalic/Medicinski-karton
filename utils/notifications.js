import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const requestNotificationPermission = async () => {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
        });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
};

export const scheduleAppointmentReminder = async (dateText) => {
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
        throw new Error("Dozvola za notifikacije nije odobrena.");
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Podsetnik za pregled",
            body: `Imaš zakazan termin/kontrolu: ${dateText}`,
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 10,
            channelId: "default",
        },
    });
};