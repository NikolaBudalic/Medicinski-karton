import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../../../firebase/config";
import { updateDoctor } from "../../../services/adminService";
import {
    createDoctorThunk,
    deleteDoctorThunk,
    fetchDoctors,
} from "../../../store/doctorsSlice";

const EMPTY_FORM = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    specialization: "",
};

export default function AdminDoctors() {
    const [search, setSearch] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingDoctorId, setEditingDoctorId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");

    const router = useRouter();
    const dispatch = useDispatch();

    const { doctors, loading, error } = useSelector((state) => state.doctors);

    useEffect(() => {
        dispatch(fetchDoctors());
    }, [dispatch]);

    const updateForm = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingDoctorId(null);
        setShowForm(false);
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.replace("/login");
    };

    const validateForm = () => {
        if (!form.firstName || !form.lastName || !form.email || !form.specialization) {
            setMessage("Popuni ime, prezime, email i specijalizaciju.");
            return false;
        }

        if (!editingDoctorId && !form.password) {
            setMessage("Za novog lekara moraš uneti šifru.");
            return false;
        }

        if (!editingDoctorId && form.password.length < 6) {
            setMessage("Šifra mora imati najmanje 6 karaktera.");
            return false;
        }

        return true;
    };

    const handleSaveDoctor = async () => {
        setMessage("");

        if (!validateForm()) return;

        try {
            if (editingDoctorId) {
                await updateDoctor(editingDoctorId, form);
                await dispatch(fetchDoctors()).unwrap();
                setMessage("Podaci lekara su uspešno izmenjeni.");
            } else {
                await dispatch(createDoctorThunk(form)).unwrap();
                setMessage("Lekar je uspešno dodat.");
            }

            resetForm();
        } catch (error) {
            setMessage(error?.message || "Došlo je do problema pri čuvanju lekara.");
        }
    };

    const handleEditDoctor = (doctor) => {
        setEditingDoctorId(doctor.id);
        setShowForm(true);

        setForm({
            firstName: doctor.firstName || "",
            lastName: doctor.lastName || "",
            email: doctor.email || "",
            password: "",
            specialization: doctor.specialization || "",
        });
    };

    const handleDeleteDoctor = async (doctorId) => {
        try {
            await dispatch(deleteDoctorThunk(doctorId)).unwrap();
            setMessage("Lekar je obrisan iz sistema.");
        } catch (error) {
            setMessage(error?.message || "Došlo je do problema pri brisanju lekara.");
        }
    };

    const filteredDoctors = doctors.filter((doctor) => {
        const fullName = `${doctor.firstName || ""} ${doctor.lastName || ""}`.toLowerCase();
        const email = (doctor.email || "").toLowerCase();
        const specialization = (doctor.specialization || "").toLowerCase();
        const searchValue = search.toLowerCase();

        return (
            fullName.includes(searchValue) ||
            email.includes(searchValue) ||
            specialization.includes(searchValue)
        );
    });

    const renderDoctor = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>
                Dr {item.firstName} {item.lastName}
            </Text>

            <Text style={styles.text}>Email: {item.email}</Text>
            <Text style={styles.text}>
                Specijalizacija: {item.specialization || "Nije uneta"}
            </Text>

            <View style={styles.actionsRow}>
                <Pressable
                    style={styles.editButton}
                    onPress={() => handleEditDoctor(item)}
                >
                    <Text style={styles.actionButtonText}>Izmeni</Text>
                </Pressable>

                <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDeleteDoctor(item.id)}
                >
                    <Text style={styles.actionButtonText}>Obriši</Text>
                </Pressable>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.container}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>Admin</Text>

                            <Pressable style={styles.logoutButton} onPress={handleLogout}>
                                <Text style={styles.logoutButtonText}>Odjavi se</Text>
                            </Pressable>
                        </View>

                        <Text style={styles.sectionTitle}>Lekari</Text>

                        {message ? <Text style={styles.message}>{message}</Text> : null}
                        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

                        <Pressable
                            style={styles.toggleButton}
                            onPress={() => setShowForm((prev) => !prev)}
                        >
                            <Text style={styles.toggleButtonText}>
                                {showForm ? "Sakrij formu" : "Dodaj novog lekara"}
                            </Text>
                        </Pressable>

                        {showForm ? (
                            <View style={styles.formCard}>
                                <Text style={styles.formTitle}>
                                    {editingDoctorId ? "Izmena lekara" : "Novi lekar"}
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Ime"
                                    value={form.firstName}
                                    onChangeText={(value) => updateForm("firstName", value)}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Prezime"
                                    value={form.lastName}
                                    onChangeText={(value) => updateForm("lastName", value)}
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    value={form.email}
                                    onChangeText={(value) => updateForm("email", value)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!editingDoctorId}
                                />

                                {!editingDoctorId ? (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Privremena šifra"
                                        value={form.password}
                                        onChangeText={(value) => updateForm("password", value)}
                                        secureTextEntry
                                    />
                                ) : null}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Specijalizacija"
                                    value={form.specialization}
                                    onChangeText={(value) => updateForm("specialization", value)}
                                />

                                <Pressable style={styles.saveButton} onPress={handleSaveDoctor}>
                                    <Text style={styles.saveButtonText}>
                                        {editingDoctorId ? "Sačuvaj izmene" : "Dodaj lekara"}
                                    </Text>
                                </Pressable>

                                {editingRecordId ? null : null}

                                {editingDoctorId ? (
                                    <Pressable style={styles.cancelButton} onPress={resetForm}>
                                        <Text style={styles.saveButtonText}>Otkaži izmenu</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        ) : null}

                        <TextInput
                            style={styles.searchInput}
                            placeholder="Pretraži lekare..."
                            value={search}
                            onChangeText={setSearch}
                        />

                        {loading ? (
                            <Text style={styles.emptyText}>Učitavanje lekara...</Text>
                        ) : (
                            <FlatList
                                data={filteredDoctors}
                                keyExtractor={(item) => item.id}
                                renderItem={renderDoctor}
                                scrollEnabled={false}
                                ListEmptyComponent={<Text>Nema lekara.</Text>}
                            />
                        )}
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
    container: { padding: 20, paddingBottom: 90 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: { fontSize: 28, fontWeight: "800" },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 16,
    },
    message: {
        color: "#15803d",
        fontWeight: "700",
        marginBottom: 10,
    },
    errorMessage: {
        color: "#dc2626",
        fontWeight: "700",
        marginBottom: 10,
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
    },
    formCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginBottom: 14,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 12,
    },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: "#15803d",
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 4,
    },
    cancelButton: {
        backgroundColor: "#64748b",
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "800",
    },
    searchInput: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 12,
    },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
    },
    name: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
    text: { fontSize: 14, marginBottom: 4 },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10,
    },
    editButton: {
        flex: 1,
        backgroundColor: "#2563eb",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    deleteButton: {
        flex: 1,
        backgroundColor: "#b91c1c",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    actionButtonText: {
        color: "#fff",
        fontWeight: "800",
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
    keyboardView: {
        flex: 1,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 20,
        color: "#64748b",
        fontWeight: "700",
    },
});