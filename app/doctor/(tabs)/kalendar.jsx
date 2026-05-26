import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { auth, db } from "../../../firebase/config";
import { getDoctorAppointments } from "../../../services/medicalRecordsService";
import { getTheme } from "../../../utils/theme";

const DAYS = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];
const MONTHS = [
    "Januar", "Februar", "Mart", "April", "Maj", "Jun",
    "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar",
];

const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

const parseDate = (value) => {
    if (!value) return null;
    const parts = value.split(".");
    if (parts.length !== 3) return null;

    const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    return Number.isNaN(date.getTime()) ? null : date;
};

const getMonthDays = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstWeekDay = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
    const emptyDays = firstWeekDay - 1;

    const days = [];

    for (let i = 0; i < emptyDays; i++) {
        days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        days.push({
            day,
            date,
            dateText: formatDate(date),
        });
    }

    return days;
};

export default function DoctorCalendar() {
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const [visibleMonth, setVisibleMonth] = useState(new Date());

    const router = useRouter();

    const themeMode = useSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const data = await getDoctorAppointments(user.uid);

        const appointmentsWithPatients = await Promise.all(
            data.map(async (item) => {
                if (!item.patientId) return item;

                const patientSnap = await getDoc(doc(db, "users", item.patientId));
                if (!patientSnap.exists()) return item;

                const patient = patientSnap.data();

                return {
                    ...item,
                    patientName: `${patient.firstName || ""} ${patient.lastName || ""}`.trim(),
                };
            })
        );

        const filteredAppointments = appointmentsWithPatients
            .filter((item) => item.nextCheck)
            .sort((a, b) => {
                const dateA = parseDate(a.nextCheck);
                const dateB = parseDate(b.nextCheck);

                if (!dateA || !dateB) return 0;
                if (dateA - dateB !== 0) return dateA - dateB;

                const timeA = a.nextCheckTime || "99:99";
                const timeB = b.nextCheckTime || "99:99";

                return timeA.localeCompare(timeB);
            });

        setAppointments(filteredAppointments);
    };

    const selectedAppointments = appointments.filter(
        (item) => item.nextCheck === selectedDate
    );

    const appointmentDates = appointments.map((item) => item.nextCheck);

    const changeMonth = (direction) => {
        const newMonth = new Date(visibleMonth);
        newMonth.setMonth(visibleMonth.getMonth() + direction);
        setVisibleMonth(newMonth);
    };

    const renderAppointment = ({ item }) => {
        const isActive = item.therapyStatus === "aktivna";

        return (
            <View style={styles.timelineRow}>
                <View style={styles.timeBox}>
                    <Text style={[styles.timeText, { color: theme.text }]}>
                        {item.nextCheckTime || "--:--"}
                    </Text>
                </View>

                <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: theme.primary }]} />
                    <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                </View>

                <Pressable
                    onPress={() => router.push(`/doctor/patient/${item.patientId}`)}
                    style={[
                        styles.appointmentCard,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.patientName, { color: theme.text }]}>
                                {item.patientName || "Pacijent"}
                            </Text>

                            <Text style={[styles.dateText, { color: theme.primary }]}>
                                {item.diagnosis || "Kontrola terapije"}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.statusBadge,
                                {
                                    backgroundColor: isActive ? "#dcfce7" : "#fee2e2",
                                },
                            ]}
                        >
                            <View style={styles.statusContent}>
                                <View
                                    style={[
                                        styles.statusDot,
                                        { backgroundColor: isActive ? "#16a34a" : "#dc2626" },
                                    ]}
                                />

                                <Text
                                    style={[
                                        styles.statusText,
                                        {
                                            color: isActive ? "#15803d" : "#dc2626",
                                        },
                                    ]}
                                >
                                    {item.therapyStatus || "aktivna"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={[styles.info, { color: theme.subtext }]}>
                        Terapija: {item.therapy || "Nije uneta"}
                    </Text>

                    <Text style={[styles.info, { color: theme.subtext }]}>
                        Datum: {item.nextCheck}
                    </Text>
                </Pressable>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>Kalendar</Text>
                        <Text style={[styles.subtitle, { color: theme.subtext }]}>
                            Zakazani pregledi i kontrole
                        </Text>
                    </View>

                    <View style={[styles.headerIcon, { backgroundColor: theme.card }]}>
                        <Icon name="calendar-outline" size={24} color={theme.primary} />
                    </View>
                </View>

                <View
                    style={[
                        styles.calendarCard,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <View style={styles.monthHeader}>
                        <Pressable
                            style={[styles.monthButton, { backgroundColor: theme.inputBackground }]}
                            onPress={() => changeMonth(-1)}
                        >
                            <Icon name="chevron-back" size={22} color={theme.text} />
                        </Pressable>

                        <Text style={[styles.monthTitle, { color: theme.text }]}>
                            {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
                        </Text>

                        <Pressable
                            style={[styles.monthButton, { backgroundColor: theme.inputBackground }]}
                            onPress={() => changeMonth(1)}
                        >
                            <Icon name="chevron-forward" size={22} color={theme.text} />
                        </Pressable>
                    </View>

                    <View style={styles.daysHeader}>
                        {DAYS.map((day) => (
                            <Text key={day} style={[styles.weekDayText, { color: theme.subtext }]}>
                                {day}
                            </Text>
                        ))}
                    </View>

                    <View style={styles.monthGrid}>
                        {monthDays.map((day, index) => {
                            if (!day) {
                                return <View key={`empty-${index}`} style={styles.dayCell} />;
                            }

                            const isSelected = selectedDate === day.dateText;
                            const hasAppointment = appointmentDates.includes(day.dateText);

                            return (
                                <Pressable
                                    key={day.dateText}
                                    style={[
                                        styles.dayCell,
                                        isSelected && { backgroundColor: theme.primary },
                                    ]}
                                    onPress={() => setSelectedDate(day.dateText)}
                                >
                                    <Text
                                        style={[
                                            styles.dayNumber,
                                            { color: isSelected ? "#fff" : theme.text },
                                        ]}
                                    >
                                        {day.day}
                                    </Text>

                                    {hasAppointment ? (
                                        <View
                                            style={[
                                                styles.appointmentDot,
                                                { backgroundColor: isSelected ? "#fff" : theme.primary },
                                            ]}
                                        />
                                    ) : null}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.selectedInfo}>
                    <Text style={[styles.selectedDate, { color: theme.text }]}>
                        {selectedDate}
                    </Text>

                    <Text style={[styles.selectedCount, { color: theme.subtext }]}>
                        Broj termina: {selectedAppointments.length}
                    </Text>
                </View>

                <FlatList
                    data={selectedAppointments}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAppointment}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={[styles.empty, { color: theme.subtext }]}>
                            Nema zakazanih termina za izabrani dan.
                        </Text>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        paddingBottom: 100,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 22,
    },
    title: {
        fontSize: 32,
        fontWeight: "900",
    },
    subtitle: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: "700",
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    calendarCard: {
        borderWidth: 1,
        borderRadius: 26,
        padding: 16,
        marginBottom: 18,
    },
    monthHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },
    monthButton: {
        width: 38,
        height: 38,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: "900",
    },
    daysHeader: {
        flexDirection: "row",
        marginBottom: 8,
    },
    weekDayText: {
        width: `${100 / 7}%`,
        textAlign: "center",
        fontSize: 12,
        fontWeight: "900",
    },
    monthGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dayCell: {
        width: `${100 / 7}%`,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        marginBottom: 4,
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: "900",
    },
    appointmentDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        marginTop: 3,
    },
    selectedInfo: {
        marginBottom: 14,
    },
    selectedDate: {
        fontSize: 18,
        fontWeight: "900",
    },
    selectedCount: {
        fontSize: 14,
        fontWeight: "700",
        marginTop: 4,
    },
    listContent: {
        paddingBottom: 130,
    },
    timelineRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    timeBox: {
        width: 56,
        paddingTop: 16,
    },
    timeText: {
        fontSize: 15,
        fontWeight: "900",
    },
    timelineLeft: {
        width: 20,
        alignItems: "center",
    },
    timelineDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginTop: 20,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        marginTop: 4,
    },
    appointmentCard: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 24,
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 12,
    },
    patientName: {
        fontSize: 17,
        fontWeight: "900",
        marginBottom: 5,
    },
    dateText: {
        fontSize: 14,
        fontWeight: "800",
    },
    info: {
        fontSize: 14,
        marginBottom: 5,
        fontWeight: "600",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "900",
    },
    empty: {
        textAlign: "center",
        marginTop: 45,
        fontSize: 15,
        fontWeight: "700",
    },
    statusContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});