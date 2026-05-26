import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { auth, db } from "../../../firebase/config";
import { getPatientMedicalRecords } from "../../../services/medicalRecordsService";
import { getTheme } from "../../../utils/theme";

export default function PatientMedicalCard() {
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState("");

    const themeMode = useSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const recordsData = await getPatientMedicalRecords(user.uid);

        const recordsWithDoctor = await Promise.all(
            recordsData.map(async (record) => {
                if (!record.doctorId) return record;

                const doctorSnap = await getDoc(doc(db, "users", record.doctorId));

                if (!doctorSnap.exists()) return record;

                const doctor = doctorSnap.data();

                return {
                    ...record,
                    doctorName: `Dr ${doctor.firstName || ""} ${doctor.lastName || ""}`.trim(),
                    doctorSpecialization: doctor.specialization || "Bez specijalizacije",
                };
            })
        );

        setRecords(recordsWithDoctor);
    };

    const filteredRecords = records.filter((item) => {
        const searchValue = search.toLowerCase();

        return (
            (item.doctorName || "").toLowerCase().includes(searchValue) ||
            (item.doctorSpecialization || "").toLowerCase().includes(searchValue) ||
            (item.diagnosis || "").toLowerCase().includes(searchValue) ||
            (item.therapy || "").toLowerCase().includes(searchValue)
        );
    });

    const activeRecords = filteredRecords.filter(
        (item) => item.therapyStatus === "aktivna"
    );

    const inactiveRecords = filteredRecords.filter(
        (item) => item.therapyStatus !== "aktivna"
    );

    const renderRecord = ({ item }) => (
        <View
            style={[
                styles.recordCard,
                {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                },
            ]}
        >
            <View style={styles.recordHeader}>
                <View>
                    <Text style={[styles.recordDate, { color: theme.subtext }]}>
                        {item.date || "Pregled"} •{" "}
                        {item.doctorSpecialization || "Specijalizacija nije uneta"}
                    </Text>

                    <Text style={[styles.recordDoctor, { color: theme.text }]}>
                        {item.doctorName || "Lekar nije pronađen"}
                    </Text>
                </View>

                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor:
                                item.therapyStatus === "aktivna"
                                    ? theme.badge
                                    : theme.orangeCard,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            {
                                color:
                                    item.therapyStatus === "aktivna"
                                        ? theme.badgeText
                                        : theme.secondary,
                            },
                        ]}
                    >
                        {item.therapyStatus || "aktivna"}
                    </Text>
                </View>
            </View>

            <Text style={[styles.text, { color: theme.text }]}>
                Dijagnoza: {item.diagnosis || "Nije uneta"}
            </Text>

            <Text style={[styles.text, { color: theme.text }]}>
                Terapija: {item.therapy || "Nije uneta"}
            </Text>

            <Text style={[styles.text, { color: theme.subtext }]}>
                Lekovi: {item.medications || "Nisu uneti"}
            </Text>

            <Text style={[styles.text, { color: theme.subtext }]}>
                Sledeća kontrola: {item.nextCheck || "Nije zakazana"}
            </Text>
        </View>
    );

    return (
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: theme.background }]}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    { backgroundColor: theme.background },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        Moj medicinski karton
                    </Text>

                    <View style={[styles.headerIcon, { backgroundColor: theme.card }]}>
                        <Icon name="options-outline" size={22} color={theme.primary} />
                    </View>
                </View>

                <View
                    style={[
                        styles.searchBox,
                        {
                            backgroundColor: theme.inputBackground,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Icon name="search-outline" size={18} color={theme.subtext} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Pretraži po lekaru, specijalizaciji, dijagnozi..."
                        placeholderTextColor={theme.subtext}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <View
                    style={[
                        styles.summaryCard,
                        {
                            backgroundColor: theme.purpleCard,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <View>
                        <Text style={[styles.summaryTitle, { color: theme.primary }]}>
                            Aktivne terapije
                        </Text>
                        <Text style={[styles.summaryText, { color: theme.text }]}>
                            {activeRecords.length === 0
                                ? "Trenutno nema aktivnih terapija."
                                : `Broj aktivnih terapija: ${activeRecords.length}`}
                        </Text>
                    </View>

                    <Icon name="medkit-outline" size={38} color={theme.primary} />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Aktivne terapije
                </Text>

                <FlatList
                    data={activeRecords}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRecord}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <Text style={[styles.empty, { color: theme.subtext }]}>
                            Trenutno nema aktivnih terapija.
                        </Text>
                    }
                />

                <View
                    style={[
                        styles.historyCard,
                        {
                            backgroundColor: theme.orangeCard,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <View>
                        <Text style={[styles.summaryTitle, { color: theme.secondary }]}>
                            Završene terapije i istorija pregleda
                        </Text>
                        <Text style={[styles.summaryText, { color: theme.text }]}>
                            {inactiveRecords.length === 0
                                ? "Nema završenih terapija."
                                : `Broj zapisa u istoriji: ${inactiveRecords.length}`}
                        </Text>
                    </View>

                    <Icon name="clipboard-outline" size={38} color={theme.secondary} />
                </View>

                <FlatList
                    data={inactiveRecords}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRecord}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <Text style={[styles.empty, { color: theme.subtext }]}>
                            Nema završenih terapija.
                        </Text>
                    }
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        padding: 20,
        paddingBottom: 90,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },
    title: {
        fontSize: 27,
        fontWeight: "900",
        flex: 1,
        marginRight: 12,
    },
    headerIcon: {
        width: 42,
        height: 42,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    searchBox: {
        borderWidth: 1,
        borderRadius: 16,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        marginBottom: 18,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
    },
    summaryCard: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 18,
        minHeight: 120,
        marginBottom: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    historyCard: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 18,
        minHeight: 120,
        marginTop: 18,
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    summaryTitle: {
        fontSize: 19,
        fontWeight: "900",
        marginBottom: 10,
    },
    summaryText: {
        fontSize: 14,
        fontWeight: "600",
        maxWidth: 210,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "900",
        marginBottom: 12,
    },
    recordCard: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
    },
    recordHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 10,
    },
    recordDate: {
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 4,
    },
    recordDoctor: {
        fontSize: 17,
        fontWeight: "900",
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "900",
        textTransform: "capitalize",
    },
    text: {
        fontSize: 14,
        marginBottom: 4,
        lineHeight: 20,
    },
    empty: {
        textAlign: "center",
        marginTop: 8,
        marginBottom: 10,
        fontSize: 15,
        fontWeight: "600",
    },
});