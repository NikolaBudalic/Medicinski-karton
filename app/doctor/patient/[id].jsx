import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
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
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { auth, db } from "../../../firebase/config";
import {
    addMedicalRecord,
    getPatientMedicalRecords,
    updateMedicalRecord,
} from "../../../services/medicalRecordsService";
import { getTheme } from "../../../utils/theme";

const INITIAL_FORM = {
    diagnosis: "",
    therapy: "",
    medications: "",
    note: "",
    therapyDuration: "",
    therapyEndDate: "",
    nextCheck: "",
    nextCheckTime: "",
};

export default function PatientRecord() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const scrollRef = useRef(null);

    const themeMode = useSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    const [patient, setPatient] = useState(null);
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [editingRecordId, setEditingRecordId] = useState(null);
    const [message, setMessage] = useState("");

    const [showPatientDetails, setShowPatientDetails] = useState(false);

    const [showNextCheckPicker, setShowNextCheckPicker] = useState(false);
    const [showNextCheckTimePicker, setShowNextCheckTimePicker] = useState(false);
    const [showTherapyEndPicker, setShowTherapyEndPicker] = useState(false);

    const [selectedNextCheckDate, setSelectedNextCheckDate] = useState(new Date());
    const [selectedNextCheckTime, setSelectedNextCheckTime] = useState(new Date());
    const [selectedTherapyEndDate, setSelectedTherapyEndDate] = useState(new Date());

    useEffect(() => {
        loadPatientData();
    }, [id]);

    const updateForm = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setEditingRecordId(null);
        setSelectedNextCheckDate(new Date());
        setSelectedNextCheckTime(new Date());
        setSelectedTherapyEndDate(new Date());
        setShowNextCheckPicker(false);
        setShowNextCheckTimePicker(false);
        setShowTherapyEndPicker(false);
    };

    const formatDate = (value) => {
        const day = String(value.getDate()).padStart(2, "0");
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const year = value.getFullYear();

        return `${day}.${month}.${year}`;
    };

    const formatTime = (value) => {
        const hours = String(value.getHours()).padStart(2, "0");
        const minutes = String(value.getMinutes()).padStart(2, "0");

        return `${hours}:${minutes}`;
    };

    const loadPatientData = async () => {
        try {
            const patientSnap = await getDoc(doc(db, "users", id));

            if (patientSnap.exists()) {
                setPatient({
                    id: patientSnap.id,
                    ...patientSnap.data(),
                });
            }

            const recordsData = await getPatientMedicalRecords(id);
            setRecords(recordsData);
        } catch {
            setMessage("Došlo je do problema pri učitavanju kartona.");
        }
    };

    const handleNextCheckChange = (event, selectedDate) => {
        if (Platform.OS === "android") setShowNextCheckPicker(false);

        if (selectedDate) {
            setSelectedNextCheckDate(selectedDate);
            updateForm("nextCheck", formatDate(selectedDate));
        }
    };

    const handleNextCheckTimeChange = (event, selectedTime) => {
        if (Platform.OS === "android") setShowNextCheckTimePicker(false);

        if (selectedTime) {
            setSelectedNextCheckTime(selectedTime);
            updateForm("nextCheckTime", formatTime(selectedTime));
        }
    };

    const handleTherapyEndDateChange = (event, selectedDate) => {
        if (Platform.OS === "android") setShowTherapyEndPicker(false);

        if (selectedDate) {
            setSelectedTherapyEndDate(selectedDate);
            updateForm("therapyEndDate", formatDate(selectedDate));
        }
    };

    const validateForm = () => {
        if (!form.diagnosis || !form.therapy) {
            setMessage("Dijagnoza i terapija su obavezne.");
            return false;
        }

        return true;
    };

    const handleAddRecord = async () => {
        setMessage("");

        if (!validateForm()) return;

        try {
            await addMedicalRecord({
                patientId: id,
                doctorId: auth.currentUser.uid,
                diagnosis: form.diagnosis,
                therapy: form.therapy,
                medications: form.medications,
                note: form.note,
                therapyDuration: form.therapyDuration,
                therapyEndDate: form.therapyEndDate,
                therapyStatus: "aktivna",
                nextCheck: form.nextCheck,
                nextCheckTime: form.nextCheckTime,
                date: new Date().toLocaleDateString("sr-RS"),
            });

            resetForm();
            setMessage("Pregled je uspešno dodat.");
            await loadPatientData();
        } catch {
            setMessage("Došlo je do problema pri čuvanju pregleda.");
        }
    };

    const handleStartEdit = (record) => {
        setEditingRecordId(record.id);

        setForm({
            diagnosis: record.diagnosis || "",
            therapy: record.therapy || "",
            medications: record.medications || "",
            note: record.note || "",
            therapyDuration: record.therapyDuration || "",
            therapyEndDate: record.therapyEndDate || "",
            nextCheck: record.nextCheck || "",
            nextCheckTime: record.nextCheckTime || "",
        });

        setTimeout(() => {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
        }, 100);
    };

    const handleUpdateRecord = async () => {
        setMessage("");

        if (!editingRecordId) return;
        if (!validateForm()) return;

        try {
            await updateMedicalRecord(editingRecordId, {
                diagnosis: form.diagnosis,
                therapy: form.therapy,
                medications: form.medications,
                note: form.note,
                therapyDuration: form.therapyDuration,
                therapyEndDate: form.therapyEndDate,
                nextCheck: form.nextCheck,
                nextCheckTime: form.nextCheckTime,
            });

            resetForm();
            setMessage("Pregled je uspešno izmenjen.");
            await loadPatientData();
        } catch {
            setMessage("Došlo je do problema pri izmeni pregleda.");
        }
    };

    const handleFinishTherapy = async (record) => {
        try {
            await updateMedicalRecord(record.id, {
                therapyStatus: "završena",
            });

            setMessage("Terapija je označena kao završena.");
            await loadPatientData();
        } catch {
            setMessage("Došlo je do problema pri završavanju terapije.");
        }
    };

    const renderPatientInfo = (label, value, icon) => (
        <View style={[styles.infoItem, { backgroundColor: theme.inputBackground }]}>
            <Icon name={icon} size={18} color={theme.primary} />
            <View style={styles.infoTextBox}>
                <Text style={[styles.infoLabel, { color: theme.subtext }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                    {value || "Nije uneto"}
                </Text>
            </View>
        </View>
    );

    const renderRecord = ({ item }) => {
        const isActive = item.therapyStatus === "aktivna";

        return (
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
                        <Text style={[styles.recordTitle, { color: theme.text }]}>
                            {item.date || "Pregled"}
                        </Text>
                        <Text style={[styles.recordSubtitle, { color: theme.subtext }]}>
                            Sledeća kontrola: {item.nextCheck || "Nije uneta"}
                            {item.nextCheckTime ? ` u ${item.nextCheckTime}` : ""}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: isActive ? "#dcfce7" : "#fee2e2" },
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
                                { color: isActive ? "#15803d" : "#dc2626" },
                            ]}
                        >
                            {item.therapyStatus || "aktivna"}
                        </Text>
                    </View>
                </View>

                <Text style={[styles.recordText, { color: theme.text }]}>
                    Dijagnoza: {item.diagnosis || "Nije uneta"}
                </Text>
                <Text style={[styles.recordText, { color: theme.text }]}>
                    Terapija: {item.therapy || "Nije uneta"}
                </Text>
                <Text style={[styles.recordText, { color: theme.subtext }]}>
                    Lekovi: {item.medications || "Nisu uneti"}
                </Text>
                <Text style={[styles.recordText, { color: theme.subtext }]}>
                    Trajanje terapije: {item.therapyDuration || "Nije uneto"}
                </Text>
                <Text style={[styles.recordText, { color: theme.subtext }]}>
                    Datum završetka terapije: {item.therapyEndDate || "Nije unet"}
                </Text>
                <Text style={[styles.recordText, { color: theme.subtext }]}>
                    Napomena: {item.note || "Nema napomene"}
                </Text>

                <Pressable style={styles.editButton} onPress={() => handleStartEdit(item)}>
                    <Text style={styles.buttonText}>Izmeni pregled</Text>
                </Pressable>

                {item.therapyStatus !== "završena" ? (
                    <Pressable
                        style={styles.finishButton}
                        onPress={() => handleFinishTherapy(item)}
                    >
                        <Text style={styles.buttonText}>Završi terapiju</Text>
                    </Pressable>
                ) : null}
            </View>
        );
    };

    const initials = `${patient?.firstName?.[0] || "P"}${patient?.lastName?.[0] || ""}`.toUpperCase();

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <Pressable
                style={[
                    styles.stickyBackButton,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                    },
                ]}
                onPress={() => router.back()}
            >
                <Icon name="chevron-back" size={20} color={theme.text} />
                <Text style={[styles.backButtonText, { color: theme.text }]}>Nazad</Text>
            </Pressable>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={styles.container}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={[styles.title, { color: theme.text }]}>
                            Karton pacijenta
                        </Text>

                        {patient ? (
                            <View
                                style={[
                                    styles.patientCard,
                                    {
                                        backgroundColor: theme.card,
                                        borderColor: theme.border,
                                    },
                                ]}
                            >
                                <View style={styles.patientHeader}>
                                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                                        <Text style={styles.avatarText}>{initials}</Text>
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.patientName, { color: theme.text }]}>
                                            {patient.firstName} {patient.lastName}
                                        </Text>
                                        <Text style={[styles.patientEmail, { color: theme.subtext }]}>
                                            {patient.email || "Email nije unet"}
                                        </Text>
                                    </View>

                                    <View style={[styles.bloodBadge, { backgroundColor: theme.badge }]}>
                                        <Text style={[styles.bloodBadgeText, { color: theme.primary }]}>
                                            {patient.bloodType || "-"}
                                        </Text>
                                    </View>
                                </View>

                                <Pressable
                                    style={[styles.dropdownHeader, { backgroundColor: theme.inputBackground }]}
                                    onPress={() => setShowPatientDetails((prev) => !prev)}
                                >
                                    <Text style={[styles.dropdownTitle, { color: theme.text }]}>
                                        Profil pacijenta
                                    </Text>

                                    <Icon
                                        name={showPatientDetails ? "chevron-up" : "chevron-down"}
                                        size={22}
                                        color={theme.primary}
                                    />
                                </Pressable>

                                {showPatientDetails ? (
                                    <View style={styles.infoGrid}>
                                        {renderPatientInfo("Datum rođenja", patient.birthDate, "calendar-outline")}
                                        {renderPatientInfo("Telefon", patient.phone, "call-outline")}
                                        {renderPatientInfo("Adresa", patient.address, "home-outline")}
                                        {renderPatientInfo("Alergije", patient.allergies, "alert-circle-outline")}
                                        {renderPatientInfo("Hronične bolesti", patient.chronicDiseases, "medkit-outline")}
                                        {renderPatientInfo("Hitan kontakt", patient.emergencyContact, "person-outline")}
                                        {renderPatientInfo("Pol", patient.gender, "body-outline")}
                                        {renderPatientInfo(
                                            "Visina / težina",
                                            `${patient.height || "-"} cm / ${patient.weight || "-"} kg`,
                                            "fitness-outline"
                                        )}
                                    </View>
                                ) : null}
                            </View>
                        ) : (
                            <Text style={[styles.emptyText, { color: theme.subtext }]}>
                                Učitavanje pacijenta...
                            </Text>
                        )}

                        <View
                            style={[
                                styles.formCard,
                                {
                                    backgroundColor: theme.card,
                                    borderColor: theme.border,
                                },
                            ]}
                        >
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                {editingRecordId ? "Izmeni pregled" : "Dodaj novi pregled"}
                            </Text>

                            {message ? <Text style={styles.message}>{message}</Text> : null}

                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        borderColor: theme.border,
                                        color: theme.text,
                                    },
                                ]}
                                placeholder="Dijagnoza *"
                                placeholderTextColor={theme.subtext}
                                value={form.diagnosis}
                                onChangeText={(value) => updateForm("diagnosis", value)}
                            />

                            <TextInput
                                style={[
                                    styles.input,
                                    styles.noteInput,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        borderColor: theme.border,
                                        color: theme.text,
                                    },
                                ]}
                                placeholder="Terapija *"
                                placeholderTextColor={theme.subtext}
                                value={form.therapy}
                                onChangeText={(value) => updateForm("therapy", value)}
                                multiline
                            />

                            <TextInput
                                style={[
                                    styles.input,
                                    styles.noteInput,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        borderColor: theme.border,
                                        color: theme.text,
                                    },
                                ]}
                                placeholder="Lekovi"
                                placeholderTextColor={theme.subtext}
                                value={form.medications}
                                onChangeText={(value) => updateForm("medications", value)}
                                multiline
                            />

                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        borderColor: theme.border,
                                        color: theme.text,
                                    },
                                ]}
                                placeholder="Trajanje terapije, npr. 7 dana"
                                placeholderTextColor={theme.subtext}
                                value={form.therapyDuration}
                                onChangeText={(value) => updateForm("therapyDuration", value)}
                            />

                            <Pressable
                                style={[
                                    styles.dateButton,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        borderColor: theme.border,
                                    },
                                ]}
                                onPress={() => setShowTherapyEndPicker(true)}
                            >
                                <Text style={[styles.dateButtonText, { color: theme.text }]}>
                                    {form.therapyEndDate || "Izaberi datum završetka terapije"}
                                </Text>
                            </Pressable>

                            {showTherapyEndPicker ? (
                                <DateTimePicker
                                    value={selectedTherapyEndDate}
                                    mode="date"
                                    display="default"
                                    onChange={handleTherapyEndDateChange}
                                    minimumDate={new Date()}
                                />
                            ) : null}

                            <TextInput
                                style={[
                                    styles.input,
                                    styles.noteInput,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        borderColor: theme.border,
                                        color: theme.text,
                                    },
                                ]}
                                placeholder="Napomena"
                                placeholderTextColor={theme.subtext}
                                value={form.note}
                                onChangeText={(value) => updateForm("note", value)}
                                multiline
                            />

                            <Pressable
                                style={[
                                    styles.dateButton,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        borderColor: theme.border,
                                    },
                                ]}
                                onPress={() => setShowNextCheckPicker(true)}
                            >
                                <Text style={[styles.dateButtonText, { color: theme.text }]}>
                                    {form.nextCheck || "Izaberi datum sledeće kontrole"}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.dateButton,
                                    {
                                        backgroundColor: theme.inputBackground,
                                        borderColor: theme.border,
                                    },
                                ]}
                                onPress={() => setShowNextCheckTimePicker(true)}
                            >
                                <Text style={[styles.dateButtonText, { color: theme.text }]}>
                                    {form.nextCheckTime || "Izaberi vreme kontrole"}
                                </Text>
                            </Pressable>

                            {showNextCheckPicker ? (
                                <DateTimePicker
                                    value={selectedNextCheckDate}
                                    mode="date"
                                    display="default"
                                    onChange={handleNextCheckChange}
                                    minimumDate={new Date()}
                                />
                            ) : null}

                            {showNextCheckTimePicker ? (
                                <DateTimePicker
                                    value={selectedNextCheckTime}
                                    mode="time"
                                    display="default"
                                    onChange={handleNextCheckTimeChange}
                                />
                            ) : null}

                            <Pressable
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={editingRecordId ? handleUpdateRecord : handleAddRecord}
                            >
                                <Text style={styles.buttonText}>
                                    {editingRecordId ? "Sačuvaj izmene" : "Sačuvaj pregled"}
                                </Text>
                            </Pressable>

                            {editingRecordId ? (
                                <Pressable style={styles.cancelButton} onPress={resetForm}>
                                    <Text style={styles.buttonText}>Otkaži izmenu</Text>
                                </Pressable>
                            ) : null}
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Istorija pregleda
                        </Text>

                        <FlatList
                            data={records}
                            keyExtractor={(item) => item.id}
                            renderItem={renderRecord}
                            scrollEnabled={false}
                            ListEmptyComponent={
                                <Text style={[styles.emptyText, { color: theme.subtext }]}>
                                    Nema unetih pregleda.
                                </Text>
                            }
                        />
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    stickyBackButton: {
        position: "absolute",
        top: 38,
        left: 18,
        zIndex: 999,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    backButtonText: {
        fontWeight: "900",
    },
    container: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 88,
        paddingBottom: 100,
    },
    title: {
        fontSize: 32,
        fontWeight: "900",
        marginBottom: 18,
    },
    patientCard: {
        borderWidth: 1,
        borderRadius: 28,
        padding: 18,
        marginBottom: 20,
    },
    patientHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },
    avatar: {
        width: 62,
        height: 62,
        borderRadius: 31,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    avatarText: {
        color: "#fff",
        fontSize: 21,
        fontWeight: "900",
    },
    patientName: {
        fontSize: 21,
        fontWeight: "900",
    },
    patientEmail: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: "700",
    },
    bloodBadge: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 16,
    },
    bloodBadgeText: {
        fontSize: 16,
        fontWeight: "900",
    },
    infoGrid: {
        gap: 10,
    },
    infoItem: {
        borderRadius: 18,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    infoTextBox: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: "800",
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "800",
    },
    formCard: {
        borderWidth: 1,
        borderRadius: 28,
        padding: 16,
        marginBottom: 22,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "900",
        marginBottom: 14,
    },
    input: {
        borderWidth: 1,
        borderRadius: 18,
        paddingHorizontal: 14,
        height: 52,
        marginBottom: 12,
        fontSize: 15,
    },
    noteInput: {
        height: 92,
        textAlignVertical: "top",
        paddingTop: 14,
    },
    dateButton: {
        borderWidth: 1,
        borderRadius: 18,
        justifyContent: "center",
        paddingHorizontal: 14,
        minHeight: 52,
        marginBottom: 12,
    },
    dateButtonText: {
        fontSize: 15,
        fontWeight: "700",
    },
    button: {
        paddingVertical: 15,
        borderRadius: 18,
        alignItems: "center",
        marginTop: 4,
    },
    cancelButton: {
        backgroundColor: "#64748b",
        paddingVertical: 15,
        borderRadius: 18,
        alignItems: "center",
        marginTop: 10,
    },
    editButton: {
        backgroundColor: "#2563eb",
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 12,
    },
    finishButton: {
        backgroundColor: "#ca8a04",
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 15,
    },
    message: {
        marginBottom: 12,
        color: "#15803d",
        fontWeight: "900",
    },
    recordCard: {
        borderWidth: 1,
        padding: 16,
        borderRadius: 24,
        marginBottom: 14,
    },
    recordHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 12,
    },
    recordTitle: {
        fontSize: 18,
        fontWeight: "900",
    },
    recordSubtitle: {
        fontSize: 13,
        marginTop: 4,
        fontWeight: "700",
    },
    recordText: {
        fontSize: 14,
        marginBottom: 5,
        fontWeight: "600",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "900",
    },
    emptyText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 15,
        fontWeight: "700",
    },
    dropdownHeader: {
        marginTop: 4,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    dropdownTitle: {
        fontSize: 15,
        fontWeight: "900",
    },
});