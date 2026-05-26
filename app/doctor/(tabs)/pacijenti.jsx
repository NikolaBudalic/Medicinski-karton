import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { auth, db } from "../../../firebase/config";
import {
    addPatientToDoctor,
    getDoctorPatients,
} from "../../../services/patientsService";
import { getTheme } from "../../../utils/theme";

export default function DoctorPatients() {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [doctorName, setDoctorName] = useState("Lekar");
    const [doctorSpecialization, setDoctorSpecialization] = useState("");

    const [showAddPatient, setShowAddPatient] = useState(false);
    const [patientEmail, setPatientEmail] = useState("");
    const [addMessage, setAddMessage] = useState("");
    const [addError, setAddError] = useState("");

    const router = useRouter();
    const themeMode = useSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    const isDark = themeMode === "dark";
    const purpleColor = isDark ? "#8b5cf6" : "#5f3df5";

    useEffect(() => {
        loadDoctorProfile();
        loadPatients();
    }, []);

    const loadDoctorProfile = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const doctorSnap = await getDoc(doc(db, "users", user.uid));

        if (doctorSnap.exists()) {
            const data = doctorSnap.data();
            setDoctorName(`Dr ${data.firstName || ""} ${data.lastName || ""}`.trim());
            setDoctorSpecialization(data.specialization || "");
        }
    };

    const loadPatients = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const data = await getDoctorPatients(user.uid);
        setPatients(data);
    };

    const handleAddPatient = async () => {
        setAddMessage("");
        setAddError("");

        const user = auth.currentUser;
        if (!user) return;

        const emailValue = patientEmail.trim().toLowerCase();

        if (!emailValue) {
            setAddError("Unesi email pacijenta.");
            return;
        }

        try {
            await addPatientToDoctor(user.uid, emailValue, doctorSpecialization);

            setPatientEmail("");
            setAddMessage("Pacijent je uspešno dodat.");
            setShowAddPatient(false);

            await loadPatients();
        } catch (error) {
            setAddError(error.message || "Dodavanje pacijenta nije uspelo.");
        }
    };

    const filteredPatients = patients.filter((patient) => {
        const searchValue = search.toLowerCase();
        const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`.toLowerCase();
        const email = (patient.email || "").toLowerCase();

        return fullName.includes(searchValue) || email.includes(searchValue);
    });

    const renderPatient = ({ item }) => {
        const initials = `${item.firstName?.[0] || "P"}${item.lastName?.[0] || ""}`.toUpperCase();
        const therapyStatus = item.therapyStatus || "nema terapije";
        const isActive = therapyStatus === "aktivna";

        return (
            <Pressable
                style={styles.cardWrapper}
                onPress={() => router.push(`/doctor/patient/${item.id}`)}
            >
                <View style={[styles.folderBack, { backgroundColor: purpleColor }]} />

                <View
                    style={[
                        styles.folderBackShadow,
                        {
                            backgroundColor: isDark ? "#a78bfa" : "#c4b5fd",
                        },
                    ]}
                />

                <View
                    style={[
                        styles.patientCard,
                        {
                            backgroundColor: theme.card,
                            borderColor: isDark ? "#2e2e3a" : "#ede9fe",
                        },
                    ]}
                >
                    <View style={[styles.folderTab, { backgroundColor: purpleColor }]} />

                    <View
                        style={[
                            styles.folderTabSoft,
                            {
                                backgroundColor: isDark ? "#7c3aed" : "#ddd6fe",
                            },
                        ]}
                    />

                    <View style={styles.cardContent}>
                        <View style={styles.topRow}>
                            <View style={[styles.avatar, { backgroundColor: purpleColor }]}>
                                <Text style={styles.avatarText}>{initials}</Text>
                            </View>

                            <View style={styles.patientMain}>
                                <Text style={[styles.patientName, { color: theme.text }]}>
                                    {item.firstName} {item.lastName}
                                </Text>

                                <Text style={[styles.patientSubtitle, { color: theme.subtext }]}>
                                    {item.gender || "Pol nije unet"} •{" "}
                                    {item.birthDate || "Datum nije unet"}
                                </Text>
                            </View>

                            <View style={styles.bloodBadge}>
                                <Text style={styles.bloodText}>{item.bloodType || "-"}</Text>
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        <View style={styles.infoRow}>
                            <Icon name="medkit-outline" size={21} color={purpleColor} />
                            <Text style={[styles.infoText, { color: theme.subtext }]}>
                                Alergije:{" "}
                                <Text style={{ color: theme.text, fontWeight: "900" }}>
                                    {item.allergies || "Nisu unete"}
                                </Text>
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Icon name="pulse-outline" size={21} color={purpleColor} />
                            <Text style={[styles.infoText, { color: theme.subtext }]}>
                                Hronične bolesti:{" "}
                                <Text style={{ color: theme.text, fontWeight: "900" }}>
                                    {item.chronicDiseases || "Nisu unete"}
                                </Text>
                            </Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        <View style={styles.bottomRow}>
                            <View style={styles.openRow}>
                                <Text style={[styles.openText, { color: purpleColor }]}>
                                    Otvori karton
                                </Text>
                                <Icon name="chevron-forward" size={20} color={purpleColor} />
                            </View>

                            <View
                                style={[
                                    styles.statusBadge,
                                    isActive ? styles.activeBadge : styles.inactiveBadge,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.statusDot,
                                        { backgroundColor: isActive ? "#16a34a" : "#dc2626" },
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.statusText,
                                        isActive ? styles.activeText : styles.inactiveText,
                                    ]}
                                >
                                    {therapyStatus}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.text }]}>Moji pacijenti</Text>
                <Text style={[styles.subtitle, { color: theme.subtext }]}>{doctorName}</Text>

                <Pressable
                    style={[styles.showAddButton, { backgroundColor: purpleColor }]}
                    onPress={() => {
                        setShowAddPatient((prev) => !prev);
                        setAddMessage("");
                        setAddError("");
                    }}
                >
                    <Icon
                        name={showAddPatient ? "close-outline" : "add-outline"}
                        size={22}
                        color="#fff"
                    />
                    <Text style={styles.showAddButtonText}>
                        {showAddPatient ? "Zatvori dodavanje" : "Dodaj pacijenta"}
                    </Text>
                </Pressable>

                {showAddPatient ? (
                    <View
                        style={[
                            styles.addPatientBox,
                            {
                                backgroundColor: theme.card,
                                borderColor: theme.border,
                            },
                        ]}
                    >
                        <Text style={[styles.addTitle, { color: theme.text }]}>
                            Email pacijenta
                        </Text>

                        <View style={styles.addRow}>
                            <TextInput
                                style={[
                                    styles.addInput,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        borderColor: theme.border,
                                        color: theme.text,
                                    },
                                ]}
                                placeholder="Unesi email pacijenta"
                                placeholderTextColor={theme.subtext}
                                value={patientEmail}
                                onChangeText={setPatientEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <Pressable
                                style={[styles.addButton, { backgroundColor: purpleColor }]}
                                onPress={handleAddPatient}
                            >
                                <Icon name="checkmark-outline" size={24} color="#fff" />
                            </Pressable>
                        </View>

                        {addError ? <Text style={styles.addError}>{addError}</Text> : null}
                    </View>
                ) : null}

                {addMessage ? <Text style={styles.addSuccess}>{addMessage}</Text> : null}

                <View
                    style={[
                        styles.searchBox,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Icon name="search-outline" size={23} color={theme.subtext} />

                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Pretraži pacijente..."
                        placeholderTextColor={theme.subtext}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <FlatList
                    data={filteredPatients}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPatient}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: theme.subtext }]}>
                            Trenutno nema pacijenata.
                        </Text>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },

    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },

    title: {
        fontSize: 34,
        fontWeight: "900",
    },

    subtitle: {
        marginTop: 4,
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 22,
    },

    showAddButton: {
        height: 52,
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },

    showAddButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "900",
        marginLeft: 8,
    },

    addPatientBox: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 16,
        marginBottom: 14,
    },

    addTitle: {
        fontSize: 16,
        fontWeight: "900",
        marginBottom: 10,
    },

    addRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    addInput: {
        flex: 1,
        height: 52,
        borderWidth: 1,
        borderRadius: 18,
        paddingHorizontal: 14,
        fontSize: 15,
        fontWeight: "600",
    },

    addButton: {
        width: 52,
        height: 52,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },

    addSuccess: {
        marginBottom: 14,
        color: "#16a34a",
        fontSize: 14,
        fontWeight: "800",
        textAlign: "center",
    },

    addError: {
        marginTop: 10,
        color: "#dc2626",
        fontSize: 14,
        fontWeight: "800",
    },

    searchBox: {
        height: 62,
        borderWidth: 1,
        borderRadius: 24,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        marginBottom: 38,
    },

    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: "600",
    },

    listContent: {
        paddingTop: 10,
        paddingBottom: 130,
    },

    cardWrapper: {
        height: 360,
        marginBottom: 54,
        position: "relative",
    },

    folderBack: {
        position: "absolute",
        top: 25,
        left: 10,
        right: 5,
        height: 350,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 34,
        borderBottomRightRadius: 30,
        zIndex: 1,
        shadowColor: "#5f3df5",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },

    folderBackShadow: {
        position: "absolute",
        top: 25,
        left: 120,
        right: 12,
        height: 15,
        borderRadius: 30,
        opacity: 0,
        zIndex: 2,
    },

    patientCard: {
        position: "absolute",
        top: 42,
        left: 0,
        right: 18,
        minHeight: 285,
        borderRadius: 30,
        borderWidth: 1,
        overflow: "hidden",
        zIndex: 3,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 7,
    },

    folderTab: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 128,
        height: 30,
        borderTopRightRadius: 40,
        borderBottomRightRadius: 0,
        zIndex: 5,
    },

    folderTabSoft: {
        position: "absolute",
        top: 0,
        left: 100,
        right: 0,
        height: 30,
        borderRadius: 0,
        opacity: 0.7,
        zIndex: 4,
    },

    cardContent: {
        padding: 22,
        paddingTop: 58,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 18,
    },

    avatarText: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "900",
    },

    patientMain: {
        flex: 1,
    },

    patientName: {
        fontSize: 20,
        fontWeight: "900",
        marginBottom: 6,
    },

    patientSubtitle: {
        fontSize: 15,
        fontWeight: "700",
    },

    bloodBadge: {
        backgroundColor: "#ffe6e6",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 18,
    },

    bloodText: {
        color: "#dc2626",
        fontSize: 18,
        fontWeight: "900",
    },

    divider: {
        height: 1,
        marginVertical: 18,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },

    infoText: {
        fontSize: 17,
        marginLeft: 14,
        fontWeight: "600",
        flex: 1,
    },

    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    openRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    openText: {
        fontSize: 18,
        fontWeight: "900",
        marginRight: 4,
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 999,
    },

    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },

    activeBadge: {
        backgroundColor: "#dcfce7",
    },

    inactiveBadge: {
        backgroundColor: "#fee2e2",
    },

    activeText: {
        color: "#15803d",
    },

    inactiveText: {
        color: "#dc2626",
    },

    statusText: {
        fontSize: 15,
        fontWeight: "900",
    },

    emptyText: {
        marginTop: 50,
        textAlign: "center",
        fontSize: 15,
        fontWeight: "700",
    },
});