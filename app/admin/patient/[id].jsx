import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    addDoctorToPatient,
    getPatientById,
    getPatientDoctors,
    getUsersByRole,
    removeDoctorFromPatient,
} from "../../../services/adminService";
import {
    deleteMedicalRecord,
    getPatientMedicalRecords,
} from "../../../services/medicalRecordsService";

export default function AdminPatientDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [patient, setPatient] = useState(null);
    const [patientDoctors, setPatientDoctors] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [records, setRecords] = useState([]);
    const [message, setMessage] = useState("");
    const [showAddDoctor, setShowAddDoctor] = useState(false);
    const [showCurrentDoctors, setShowCurrentDoctors] = useState(false);
    const [showPatientProfile, setShowPatientProfile] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        const patientData = await getPatientById(id);
        const doctorsData = await getPatientDoctors(id);
        const allDoctorsData = await getUsersByRole("lekar");
        const recordsData = await getPatientMedicalRecords(id);

        setPatient(patientData);
        setPatientDoctors(doctorsData);
        setAllDoctors(allDoctorsData);
        setRecords(recordsData);
    };

    const handleRemoveDoctor = async (relationId) => {
        await removeDoctorFromPatient(relationId);
        setMessage("Lekar je uklonjen pacijentu.");
        await loadData();
    };

    const handleAddDoctor = async (doctor) => {
        setMessage("");

        try {
            await addDoctorToPatient(id, doctor);
            setMessage("Lekar je uspešno dodeljen pacijentu.");
            setShowAddDoctor(false);
            await loadData();
        } catch (error) {
            setMessage(error.message);
        }
    };

    const handleDeleteRecord = async (recordId) => {
        try {
            await deleteMedicalRecord(recordId);
            setMessage("Pregled je uspešno obrisan.");
            await loadData();
        } catch {
            setMessage("Došlo je do problema pri brisanju pregleda.");
        }
    };

    const availableDoctors = allDoctors.filter((doctor) => {
        return !patientDoctors.some(
            (relation) => relation.doctor?.id === doctor.id
        );
    });

    const renderCurrentDoctor = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>
                Dr {item.doctor.firstName} {item.doctor.lastName}
            </Text>

            <Text style={styles.text}>
                Specijalizacija: {item.doctor.specialization || item.specialization}
            </Text>

            <Text style={styles.text}>Email: {item.doctor.email}</Text>

            <Pressable
                style={styles.deleteButton}
                onPress={() => handleRemoveDoctor(item.relationId)}
            >
                <Text style={styles.deleteButtonText}>Ukloni lekara</Text>
            </Pressable>
        </View>
    );

    const renderAvailableDoctor = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>
                Dr {item.firstName} {item.lastName}
            </Text>

            <Text style={styles.text}>
                Specijalizacija: {item.specialization || "Nije uneta"}
            </Text>

            <Text style={styles.text}>Email: {item.email}</Text>

            <Pressable
                style={styles.addButton}
                onPress={() => handleAddDoctor(item)}
            >
                <Text style={styles.addButtonText}>Dodaj ovog lekara</Text>
            </Pressable>
        </View>
    );

    const renderRecord = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>{item.date || "Pregled"}</Text>
            <Text style={styles.text}>Dijagnoza: {item.diagnosis || "Nije uneta"}</Text>
            <Text style={styles.text}>Terapija: {item.therapy || "Nije uneta"}</Text>
            <Text style={styles.text}>Lekovi: {item.medications || "Nisu uneti"}</Text>
            <Text style={styles.text}>Status: {item.therapyStatus || "aktivna"}</Text>
            <Text style={styles.text}>
                Datum završetka terapije: {item.therapyEndDate || "Nije unet"}
            </Text>
            <Text style={styles.text}>
                Sledeća kontrola: {item.nextCheck || "Nije uneta"}
            </Text>

            <Pressable
                style={styles.deleteButton}
                onPress={() => handleDeleteRecord(item.id)}
            >
                <Text style={styles.deleteButtonText}>Obriši pregled</Text>
            </Pressable>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>← Nazad</Text>
                </Pressable>
                <Text style={styles.title}>Pacijent</Text>

                {message ? <Text style={styles.message}>{message}</Text> : null}

                {patient ? (
                    <View style={styles.profileCard}>
                        <View style={styles.profileHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {`${patient.firstName?.[0] || "P"}${patient.lastName?.[0] || ""}`}
                                </Text>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={styles.patientName}>
                                    {patient.firstName} {patient.lastName}
                                </Text>
                                <Text style={styles.patientEmail}>
                                    {patient.email || "Email nije unet"}
                                </Text>
                            </View>

                            <View style={styles.bloodBadge}>
                                <Text style={styles.bloodText}>
                                    {patient.bloodType || "-"}
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            style={styles.profileToggle}
                            onPress={() => setShowPatientProfile((prev) => !prev)}
                        >
                            <Text style={styles.profileToggleText}>Profil pacijenta</Text>
                            <Text style={styles.profileToggleIcon}>
                                {showPatientProfile ? "⌃" : "⌄"}
                            </Text>
                        </Pressable>

                        {showPatientProfile ? (
                            <View style={styles.profileDetails}>
                                <Text style={styles.text}>Datum rođenja: {patient.birthDate || "Nije unet"}</Text>
                                <Text style={styles.text}>Telefon: {patient.phone || "Nije unet"}</Text>
                                <Text style={styles.text}>Adresa: {patient.address || "Nije uneta"}</Text>
                                <Text style={styles.text}>Alergije: {patient.allergies || "Nisu unete"}</Text>
                                <Text style={styles.text}>Hronične bolesti: {patient.chronicDiseases || "Nisu unete"}</Text>
                                <Text style={styles.text}>Pol: {patient.gender || "Nije unet"}</Text>
                            </View>
                        ) : null}
                    </View>
                ) : (
                    <Text>Učitavanje pacijenta...</Text>
                )}

                <View style={styles.section}>
                    <Pressable
                        style={styles.toggleButton}
                        onPress={() => setShowCurrentDoctors((prev) => !prev)}
                    >
                        <Text style={styles.toggleButtonText}>
                            {showCurrentDoctors ? "Sakrij trenutne lekare" : "Prikaži trenutne lekare"}
                        </Text>
                    </Pressable>

                    {showCurrentDoctors ? (
                        <>
                            <Text style={styles.sectionTitle}>Trenutni lekari</Text>

                            <FlatList
                                data={patientDoctors}
                                keyExtractor={(item) => item.relationId}
                                renderItem={renderCurrentDoctor}
                                scrollEnabled={false}
                                ListEmptyComponent={
                                    <Text style={styles.empty}>Pacijent trenutno nema lekara.</Text>
                                }
                            />
                        </>
                    ) : null}
                </View>


                <View style={styles.section}>
                    <Pressable
                        style={styles.toggleButton}
                        onPress={() => setShowAddDoctor((prev) => !prev)}
                    >
                        <Text style={styles.toggleButtonText}>
                            {showAddDoctor ? "Sakrij dodavanje lekara" : "Dodaj lekara pacijentu"}
                        </Text>
                    </Pressable>

                    {showAddDoctor ? (
                        <>
                            <Text style={styles.sectionTitle}>Dostupni lekari</Text>

                            <FlatList
                                data={availableDoctors}
                                keyExtractor={(item) => item.id}
                                renderItem={renderAvailableDoctor}
                                scrollEnabled={false}
                                ListEmptyComponent={
                                    <Text style={styles.empty}>Nema dostupnih lekara za dodavanje.</Text>
                                }
                            />
                        </>
                    ) : null}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Karton pacijenta</Text>

                    <FlatList
                        data={records}
                        keyExtractor={(item) => item.id}
                        renderItem={renderRecord}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <Text style={styles.empty}>Nema unetih pregleda.</Text>
                        }
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    container: {
        padding: 20,
        paddingBottom: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 16,
    },
    section: {
        marginTop: 8,
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 12,
    },
    patientCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginBottom: 18,
    },
    patientName: {
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 8,
    },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 6,
    },
    text: {
        fontSize: 14,
        marginBottom: 4,
    },
    message: {
        color: "#15803d",
        fontWeight: "700",
        marginBottom: 10,
    },
    empty: {
        textAlign: "center",
        marginTop: 10,
        marginBottom: 10,
        fontSize: 15,
        color: "#64748b",
    },
    toggleButton: {
        backgroundColor: "#1d4ed8",
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 12,
    },
    toggleButtonText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 15,
    },
    addButton: {
        backgroundColor: "#15803d",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "800",
    },
    deleteButton: {
        backgroundColor: "#b91c1c",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    deleteButtonText: {
        color: "#fff",
        fontWeight: "800",
    },
    backButton: {
        alignSelf: "flex-start",
        backgroundColor: "#e5e7eb",
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 10,
        marginBottom: 12,
    },

    backButtonText: {
        color: "#111827",
        fontWeight: "800",
    },
    profileCard: {
        backgroundColor: "#fff",
        borderRadius: 22,
        padding: 18,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },

    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },

    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#6d4aff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },

    avatarText: {
        color: "#fff",
        fontSize: 19,
        fontWeight: "900",
    },

    patientEmail: {
        color: "#64748b",
        fontWeight: "700",
        marginTop: 4,
    },

    bloodBadge: {
        backgroundColor: "#ede9fe",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
    },

    bloodText: {
        color: "#6d4aff",
        fontWeight: "900",
    },

    profileToggle: {
        paddingTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    profileToggleText: {
        fontSize: 15,
        fontWeight: "900",
    },

    profileToggleIcon: {
        fontSize: 22,
        color: "#6d4aff",
        fontWeight: "900",
    },

    profileDetails: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },

});