import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
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
import { useDispatch, useSelector } from "react-redux";
import { auth, db } from "../../../firebase/config";
import { toggleTheme } from "../../../store/themeSlice";
import { getTheme } from "../../../utils/theme";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"];

export default function PatientProfile() {
    const router = useRouter();
    const dispatch = useDispatch();

    const themeMode = useSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    const [editing, setEditing] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
    const [showBloodTypes, setShowBloodTypes] = useState(false);
    const [selectedBirthDate, setSelectedBirthDate] = useState(new Date());
    const [message, setMessage] = useState("");

    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        birthDate: "",
        bloodType: "",
        email: "",
        phone: "",
        address: "",
        allergies: "",
        chronicDiseases: "",
        emergencyContact: "",
        gender: "",
        height: "",
        weight: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const updateProfile = (field, value) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    const openSection = (section) => {
        setActiveSection(section);
        setEditing(true);
        setMessage("");
    };

    const formatDate = (value) => {
        const day = String(value.getDate()).padStart(2, "0");
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const year = value.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const parseDateString = (dateString) => {
        const parts = dateString.split(".");
        if (parts.length !== 3) return new Date();

        const parsed = new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0])
        );

        return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const loadProfile = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (userSnap.exists()) {
            const data = userSnap.data();

            setProfile({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                birthDate: data.birthDate || "",
                bloodType: data.bloodType || "",
                email: data.email || user.email || "",
                phone: data.phone || "",
                address: data.address || "",
                allergies: data.allergies || "",
                chronicDiseases: data.chronicDiseases || "",
                emergencyContact: data.emergencyContact || "",
                gender: data.gender || "",
                height: data.height || "",
                weight: data.weight || "",
            });

            if (data.birthDate) {
                setSelectedBirthDate(parseDateString(data.birthDate));
            }
        }
    };

    const handleBirthDateChange = (event, selectedDate) => {
        if (Platform.OS === "android") setShowBirthDatePicker(false);

        if (selectedDate) {
            setSelectedBirthDate(selectedDate);
            updateProfile("birthDate", formatDate(selectedDate));
        }
    };

    const handleSave = async () => {
        setMessage("");

        if (!profile.firstName || !profile.lastName || !profile.birthDate || !profile.bloodType) {
            setMessage("Ime, prezime, datum rođenja i krvna grupa su obavezni.");
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) return;

            await updateDoc(doc(db, "users", user.uid), {
                firstName: profile.firstName,
                lastName: profile.lastName,
                birthDate: profile.birthDate,
                bloodType: profile.bloodType,
                phone: profile.phone,
                address: profile.address,
                allergies: profile.allergies,
                chronicDiseases: profile.chronicDiseases,
                emergencyContact: profile.emergencyContact,
                gender: profile.gender,
                height: profile.height,
                weight: profile.weight,
                updatedAt: new Date().toISOString(),
            });

            setEditing(false);
            setActiveSection(null);
            setMessage("Profil je uspešno ažuriran.");
        } catch {
            setMessage("Došlo je do problema pri čuvanju profila.");
        }
    };

    const handleCancel = async () => {
        setEditing(false);
        setActiveSection(null);
        setMessage("");
        setShowBloodTypes(false);
        setShowBirthDatePicker(false);
        await loadProfile();
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.replace("/login");
    };

    const renderMenuItem = (icon, title, subtitle, section) => (
        <Pressable style={styles.menuItem} onPress={() => openSection(section)}>
            <View style={[styles.menuIcon, { backgroundColor: theme.badge }]}>
                <Icon name={icon} size={18} color={theme.primary} />
            </View>

            <View style={styles.menuTextBox}>
                <Text style={[styles.menuTitle, { color: theme.text }]}>{title}</Text>
                <Text style={[styles.menuSubtitle, { color: theme.subtext }]}>
                    {subtitle}
                </Text>
            </View>

            <Icon name="chevron-forward" size={18} color={theme.subtext} />
        </Pressable>
    );

    const renderInput = (label, field, placeholder, keyboardType = "default") => (
        <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.subtext }]}>{label}</Text>

            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.border,
                        color: theme.text,
                    },
                ]}
                value={profile[field]}
                onChangeText={(value) => updateProfile(field, value)}
                placeholder={placeholder}
                placeholderTextColor={theme.subtext}
                keyboardType={keyboardType}
            />
        </View>
    );

    const renderPersonalSection = () => (
        <>
            {renderInput("Ime", "firstName", "Unesi ime")}
            {renderInput("Prezime", "lastName", "Unesi prezime")}

            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.subtext }]}>
                    Datum rođenja
                </Text>

                <Pressable
                    style={[
                        styles.dateButton,
                        {
                            backgroundColor: theme.inputBackground,
                            borderColor: theme.border,
                        },
                    ]}
                    onPress={() => setShowBirthDatePicker(true)}
                >
                    <Text style={{ color: theme.text }}>
                        {profile.birthDate || "Izaberi datum rođenja"}
                    </Text>
                </Pressable>
            </View>

            {showBirthDatePicker ? (
                <DateTimePicker
                    value={selectedBirthDate}
                    mode="date"
                    display="default"
                    onChange={handleBirthDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1940, 0, 1)}
                />
            ) : null}

            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.subtext }]}>
                    Krvna grupa
                </Text>

                <Pressable
                    style={[
                        styles.dateButton,
                        {
                            backgroundColor: theme.inputBackground,
                            borderColor: theme.border,
                        },
                    ]}
                    onPress={() => setShowBloodTypes((prev) => !prev)}
                >
                    <Text style={{ color: theme.text }}>
                        {profile.bloodType || "Izaberi krvnu grupu"}
                    </Text>
                </Pressable>

                {showBloodTypes ? (
                    <View style={styles.bloodTypeGrid}>
                        {BLOOD_TYPES.map((type) => (
                            <Pressable
                                key={type}
                                style={[
                                    styles.bloodTypeButton,
                                    {
                                        backgroundColor:
                                            profile.bloodType === type
                                                ? theme.primary
                                                : theme.inputBackground,
                                        borderColor: theme.border,
                                    },
                                ]}
                                onPress={() => {
                                    updateProfile("bloodType", type);
                                    setShowBloodTypes(false);
                                }}
                            >
                                <Text
                                    style={{
                                        color: profile.bloodType === type ? "#fff" : theme.text,
                                        fontWeight: "900",
                                    }}
                                >
                                    {type}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                ) : null}
            </View>
        </>
    );

    const renderActiveSection = () => {
        if (activeSection === "personal") {
            return renderPersonalSection();
        }

        if (activeSection === "health") {
            return (
                <>
                    {renderInput("Alergije", "allergies", "npr. Penicilin, polen")}
                    {renderInput("Hronične bolesti", "chronicDiseases", "npr. Astma, dijabetes")}
                </>
            );
        }

        if (activeSection === "emergency") {
            return renderInput("Hitan kontakt", "emergencyContact", "Ime i broj telefona");
        }

        if (activeSection === "body") {
            return (
                <>
                    {renderInput("Pol", "gender", "Muški / Ženski")}
                    {renderInput("Visina", "height", "npr. 180", "numeric")}
                    {renderInput("Težina", "weight", "npr. 75", "numeric")}
                </>
            );
        }

        if (activeSection === "contact") {
            return (
                <>
                    {renderInput("Telefon", "phone", "Unesi broj telefona", "phone-pad")}
                    {renderInput("Adresa", "address", "Unesi adresu")}
                </>
            );
        }

        return null;
    };

    const getSectionTitle = () => {
        if (activeSection === "personal") return "Lični podaci";
        if (activeSection === "health") return "Alergije i bolesti";
        if (activeSection === "emergency") return "Hitan kontakt";
        if (activeSection === "body") return "Telesne informacije";
        if (activeSection === "contact") return "Kontakt podaci";
        return "Izmena profila";
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={[
                            styles.container,
                            { backgroundColor: theme.background },
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: theme.text }]}>Profil</Text>
                            <Icon name="settings-outline" size={24} color={theme.text} />
                        </View>

                        <View
                            style={[
                                styles.profileCard,
                                {
                                    backgroundColor: theme.card,
                                    borderColor: theme.border,
                                },
                            ]}
                        >
                            <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
                                <Text style={styles.avatarText}>
                                    {(profile.firstName?.[0] || "P").toUpperCase()}
                                    {(profile.lastName?.[0] || "").toUpperCase()}
                                </Text>
                            </View>

                            <Text style={[styles.patientName, { color: theme.text }]}>
                                {profile.firstName} {profile.lastName}
                            </Text>

                            <Text style={[styles.email, { color: theme.subtext }]}>
                                {profile.email}
                            </Text>
                        </View>

                        {message ? <Text style={styles.message}>{message}</Text> : null}

                        {!editing ? (
                            <>
                                <View
                                    style={[
                                        styles.menuCard,
                                        {
                                            backgroundColor: theme.card,
                                            borderColor: theme.border,
                                        },
                                    ]}
                                >
                                    {renderMenuItem(
                                        "person-outline",
                                        "Lični podaci",
                                        `${profile.birthDate || "Datum nije unet"} • ${profile.bloodType || "Krvna grupa nije uneta"
                                        }`,
                                        "personal"
                                    )}

                                    {renderMenuItem(
                                        "shield-checkmark-outline",
                                        "Alergije i bolesti",
                                        profile.allergies || "Alergije nisu unete",
                                        "health"
                                    )}

                                    {renderMenuItem(
                                        "call-outline",
                                        "Hitan kontakt",
                                        profile.emergencyContact || "Nije unet",
                                        "emergency"
                                    )}

                                    {renderMenuItem(
                                        "body-outline",
                                        "Telesne informacije",
                                        `${profile.height || "-"} cm • ${profile.weight || "-"} kg`,
                                        "body"
                                    )}

                                    {renderMenuItem(
                                        "home-outline",
                                        "Kontakt podaci",
                                        profile.phone || "Telefon nije unet",
                                        "contact"
                                    )}
                                </View>

                                <Pressable
                                    style={[
                                        styles.outlineButton,
                                        {
                                            borderColor: theme.border,
                                            backgroundColor: theme.card,
                                        },
                                    ]}
                                    onPress={() => dispatch(toggleTheme())}
                                >
                                    <Text style={[styles.outlineButtonText, { color: theme.text }]}>
                                        Promeni temu
                                    </Text>

                                    <Icon
                                        name={themeMode === "light" ? "moon-outline" : "sunny-outline"}
                                        size={20}
                                        color={theme.text}
                                    />
                                </Pressable>

                                <Pressable style={styles.logoutButton} onPress={handleLogout}>
                                    <Text style={styles.logoutButtonText}>Odjavi se</Text>
                                    <Icon name="log-out-outline" size={20} color="#ef4444" />
                                </Pressable>
                            </>
                        ) : (
                            <View
                                style={[
                                    styles.editCard,
                                    {
                                        backgroundColor: theme.card,
                                        borderColor: theme.border,
                                    },
                                ]}
                            >
                                <Text style={[styles.editTitle, { color: theme.text }]}>
                                    {getSectionTitle()}
                                </Text>

                                {renderActiveSection()}

                                <Pressable
                                    style={[
                                        styles.primaryButton,
                                        { backgroundColor: theme.primary },
                                    ]}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.buttonText}>Sačuvaj izmene</Text>
                                </Pressable>

                                <Pressable style={styles.cancelButton} onPress={handleCancel}>
                                    <Text style={styles.buttonText}>Otkaži</Text>
                                </Pressable>
                            </View>
                        )}
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    keyboardView: { flex: 1 },
    container: {
        padding: 20,
        paddingBottom: 100,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },
    title: {
        fontSize: 28,
        fontWeight: "900",
    },
    profileCard: {
        borderWidth: 1,
        borderRadius: 26,
        padding: 22,
        alignItems: "center",
        marginBottom: 18,
    },
    avatarCircle: {
        width: 86,
        height: 86,
        borderRadius: 43,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    avatarText: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "900",
    },
    patientName: {
        fontSize: 21,
        fontWeight: "900",
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        fontWeight: "600",
    },
    menuCard: {
        borderWidth: 1,
        borderRadius: 22,
        overflow: "hidden",
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#94a3b8",
    },
    menuIcon: {
        width: 34,
        height: 34,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    menuTextBox: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: "900",
    },
    menuSubtitle: {
        fontSize: 12,
        marginTop: 2,
        fontWeight: "600",
    },
    editCard: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 16,
    },
    editTitle: {
        fontSize: 20,
        fontWeight: "900",
        marginBottom: 14,
    },
    inputGroup: {
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: "800",
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        height: 52,
        fontSize: 15,
    },
    dateButton: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 15,
    },
    bloodTypeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
    },
    bloodTypeButton: {
        width: "23%",
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: "center",
    },
    primaryButton: {
        paddingVertical: 15,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 8,
    },
    outlineButton: {
        borderWidth: 1,
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        flexDirection: "row",
        gap: 10,
    },
    outlineButtonText: {
        fontWeight: "900",
        fontSize: 15,
    },
    logoutButton: {
        backgroundColor: "#fee2e2",
        borderWidth: 1,
        borderColor: "#fecaca",
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        flexDirection: "row",
        gap: 10,
    },
    logoutButtonText: {
        color: "#ef4444",
        fontWeight: "900",
        fontSize: 15,
    },
    cancelButton: {
        backgroundColor: "#64748b",
        paddingVertical: 15,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 12,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 15,
    },
    message: {
        color: "#16a34a",
        fontWeight: "800",
        marginBottom: 12,
    },
});