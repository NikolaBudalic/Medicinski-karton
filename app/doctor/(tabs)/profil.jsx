import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { auth, db } from "../../../firebase/config";
import { toggleTheme } from "../../../store/themeSlice";
import { getTheme } from "../../../utils/theme";

export default function DoctorProfile() {
    const [doctor, setDoctor] = useState(null);

    const router = useRouter();
    const dispatch = useDispatch();

    const themeMode = useSelector((state) => state.theme.mode);
    const theme = getTheme(themeMode);

    useEffect(() => {
        loadDoctor();
    }, []);

    const loadDoctor = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const doctorSnap = await getDoc(doc(db, "users", user.uid));

        if (doctorSnap.exists()) {
            setDoctor({
                id: doctorSnap.id,
                ...doctorSnap.data(),
            });
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.replace("/login");
    };

    const initials = `${doctor?.firstName?.[0] || "D"}${doctor?.lastName?.[0] || "R"}`.toUpperCase();

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.text }]}>Profil</Text>

                <View
                    style={[
                        styles.profileCard,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>

                    <Text style={[styles.name, { color: theme.text }]}>
                        Dr {doctor?.firstName || ""} {doctor?.lastName || ""}
                    </Text>

                    <Text style={[styles.specialization, { color: theme.primary }]}>
                        {doctor?.specialization || "Specijalizacija nije uneta"}
                    </Text>
                </View>

                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <View style={styles.infoRow}>
                        <Icon name="mail-outline" size={22} color={theme.subtext} />
                        <Text style={[styles.infoText, { color: theme.text }]}>
                            {doctor?.email || "Email nije unet"}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Icon name="medkit-outline" size={22} color={theme.subtext} />
                        <Text style={[styles.infoText, { color: theme.text }]}>
                            {doctor?.specialization || "Specijalizacija nije uneta"}
                        </Text>
                    </View>
                </View>

                <Pressable
                    style={[
                        styles.themeButton,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        },
                    ]}
                    onPress={() => dispatch(toggleTheme())}
                >
                    <Text style={[styles.themeButtonText, { color: theme.text }]}>
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
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        padding: 20,
        paddingBottom: 100,
    },
    title: {
        fontSize: 28,
        fontWeight: "900",
        marginBottom: 18,
    },
    profileCard: {
        borderWidth: 1,
        borderRadius: 26,
        padding: 24,
        alignItems: "center",
        marginBottom: 18,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },
    avatarText: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "900",
    },
    name: {
        fontSize: 22,
        fontWeight: "900",
        marginBottom: 4,
    },
    specialization: {
        fontSize: 16,
        fontWeight: "800",
    },
    card: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 16,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        gap: 12,
    },
    infoText: {
        fontSize: 15,
        fontWeight: "700",
    },
    themeButton: {
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
    themeButtonText: {
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
});