import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../../firebase/config";
import { getUsersByRole } from "../../../services/adminService";

export default function AdminPatients() {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");

    const router = useRouter();

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        const patientsData = await getUsersByRole("pacijent");
        setPatients(patientsData);
    };
    const handleLogout = async () => {
        await signOut(auth);
        router.replace("/login");
    };

    const filteredPatients = patients.filter((patient) => {
        const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`.toLowerCase();
        const email = (patient.email || "").toLowerCase();
        const searchValue = search.toLowerCase();

        return fullName.includes(searchValue) || email.includes(searchValue);
    });

    const renderPatient = ({ item }) => (
        <Pressable
            style={styles.card}
            onPress={() => router.push(`/admin/patient/${item.id}`)}
        >
            <Text style={styles.name}>
                {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.text}>Email: {item.email}</Text>
            <Text style={styles.text}>
                Krvna grupa: {item.bloodType || "Nije uneta"}
            </Text>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Admin</Text>

                    <Pressable style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>Odjavi se</Text>
                    </Pressable>
                </View>
                <Text style={styles.sectionTitle}> Pacijenti</Text>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Pretraži pacijente..."
                    value={search}
                    onChangeText={setSearch}
                />

                <FlatList
                    data={filteredPatients}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPatient}
                    scrollEnabled={false}
                    ListEmptyComponent={<Text>Nema pacijenata.</Text>}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
    container: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 28, fontWeight: "800" },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
    },
    name: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
    text: { fontSize: 14, marginBottom: 4 },
    searchInput: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    logoutButton: {
        backgroundColor: "#b91c1c",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
    },

    logoutButtonText: {
        color: "#fff",
        fontWeight: "700",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 16,
    },
});