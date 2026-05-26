import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { auth, db } from "../../../firebase/config";
import { getPatientDoctors } from "../../../services/adminService";
import { getTheme } from "../../../utils/theme";

export default function PatientDoctors() {
    const [patient, setPatient] = useState(null);
    const [doctors, setDoctors] = useState([]);

    const themeMode = useSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const patientRef = doc(db, "users", user.uid);
        const patientSnap = await getDoc(patientRef);

        if (patientSnap.exists()) {
            setPatient({
                id: patientSnap.id,
                ...patientSnap.data(),
            });
        }

        const doctorsData = await getPatientDoctors(user.uid);
        setDoctors(doctorsData);
    };

    const renderDoctor = ({ item }) => {
        const doctor = item.doctor || {};
        const initials = `${doctor.firstName?.[0] || "D"}${doctor.lastName?.[0] || ""}`.toUpperCase();

        return (
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                    },
                ]}
            >
                <View style={[styles.avatar, { backgroundColor: theme.badge }]}>
                    <Text style={[styles.avatarText, { color: theme.badgeText }]}>
                        {initials}
                    </Text>
                </View>

                <View style={styles.doctorInfo}>
                    <Text style={[styles.name, { color: theme.text }]}>
                        Dr {doctor.firstName} {doctor.lastName}
                    </Text>

                    <Text style={[styles.text, { color: theme.subtext }]}>
                        {doctor.specialization || item.specialization || "Specijalizacija nije uneta"}
                    </Text>

                    <Text style={[styles.text, { color: theme.subtext }]}>
                        Email: {doctor.email || "Nije unet"}
                    </Text>

                    <Text style={[styles.text, { color: theme.subtext }]}>
                        Dodeljen:{" "}
                        {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("sr-RS")
                            : "Nije poznato"}
                    </Text>
                </View>

                <Icon name="call-outline" size={24} color={theme.primary} />
            </View>
        );
    };

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
                <Text style={[styles.title, { color: theme.text }]}>Moji lekari</Text>

                {patient ? (
                    <View
                        style={[
                            styles.patientCard,
                            {
                                backgroundColor: theme.cardSoft,
                                borderColor: theme.border,
                            },
                        ]}
                    >
                        <View>
                            <Text style={[styles.patientName, { color: theme.text }]}>
                                {patient.firstName} {patient.lastName}
                            </Text>

                            <Text style={[styles.text, { color: theme.subtext }]}>
                                Email: {patient.email}
                            </Text>
                        </View>

                        <Icon name="people-outline" size={34} color={theme.primary} />
                    </View>
                ) : null}

                <FlatList
                    data={doctors}
                    keyExtractor={(item) => item.relationId}
                    renderItem={renderDoctor}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <View
                            style={[
                                styles.emptyCard,
                                {
                                    backgroundColor: theme.card,
                                    borderColor: theme.border,
                                },
                            ]}
                        >
                            <Icon name="medkit-outline" size={38} color={theme.primary} />
                            <Text style={[styles.emptyText, { color: theme.subtext }]}>
                                Trenutno nema dodeljenih lekara.
                            </Text>
                        </View>
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
    title: {
        fontSize: 28,
        fontWeight: "900",
        marginBottom: 18,
    },
    patientCard: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 18,
        marginBottom: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    patientName: {
        fontSize: 20,
        fontWeight: "900",
        marginBottom: 4,
    },
    card: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 16,
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "900",
    },
    doctorInfo: {
        flex: 1,
    },
    name: {
        fontSize: 17,
        fontWeight: "900",
        marginBottom: 4,
    },
    text: {
        fontSize: 14,
        marginBottom: 3,
        lineHeight: 19,
    },
    emptyCard: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 24,
        alignItems: "center",
        marginTop: 20,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
    },
});