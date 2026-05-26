import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
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
import { useSelector } from "react-redux";
import { auth, db } from "../firebase/config";
import { getTheme } from "../utils/theme";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"];

export default function Register() {
  const router = useRouter();
  const themeMode = useSelector((state) => state.theme.mode);
  const theme = getTheme(themeMode);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [birthDate, setBirthDate] = useState("");
  const [selectedBirthDate, setSelectedBirthDate] = useState(new Date());
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

  const [bloodType, setBloodType] = useState("");
  const [showBloodTypes, setShowBloodTypes] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const formatDate = (value) => {
    const day = String(value.getDate()).padStart(2, "0");
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const year = value.getFullYear();

    return `${day}.${month}.${year}`;
  };

  const handleBirthDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowBirthDatePicker(false);
    }

    if (selectedDate) {
      setSelectedBirthDate(selectedDate);
      setBirthDate(formatDate(selectedDate));
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setBirthDate("");
    setSelectedBirthDate(new Date());
    setBloodType("");
    setShowBloodTypes(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleRegister = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !birthDate ||
      !bloodType ||
      !trimmedEmail ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage("Popuni sva obavezna polja.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Unesi ispravan email.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Šifra mora imati najmanje 6 karaktera.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Šifre se ne poklapaju.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        birthDate,
        bloodType,
        email: trimmedEmail,
        role: "pacijent",
        phone: "",
        address: "",
        allergies: "",
        createdAt: new Date().toISOString(),
      });

      resetForm();

      setSuccessMessage(
        "Registracija je uspešna. Sada možeš da se prijaviš."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch {
      setErrorMessage("Registracija nije uspela. Proveri podatke.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
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
            <View style={[styles.headerBox, { backgroundColor: theme.primary }]}>
              <Text style={styles.headerTitle}>Registracija</Text>
              <Text style={styles.headerSubtitle}>
                Unesi podatke za kreiranje naloga pacijenta
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
              {successMessage ? (
                <Text style={styles.successMessage}>{successMessage}</Text>
              ) : null}

              {errorMessage ? (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              ) : null}

              <Text style={[styles.label, { color: theme.text }]}>Ime *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Unesi ime"
                placeholderTextColor={theme.subtext}
                value={firstName}
                onChangeText={setFirstName}
                returnKeyType="next"
              />

              <Text style={[styles.label, { color: theme.text }]}>Prezime *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Unesi prezime"
                placeholderTextColor={theme.subtext}
                value={lastName}
                onChangeText={setLastName}
                returnKeyType="next"
              />

              <Text style={[styles.label, { color: theme.text }]}>Datum rođenja *</Text>
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
                <Text style={[styles.dateButtonText, { color: theme.text }]}>
                  {birthDate || "Izaberi datum rođenja"}
                </Text>
              </Pressable>

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

              <Text style={[styles.label, { color: theme.text }]}>Krvna grupa *</Text>
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
                <Text style={[styles.dateButtonText, { color: theme.text }]}>
                  {bloodType || "Izaberi krvnu grupu"}
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
                            bloodType === type ? theme.primary : theme.inputBackground,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => {
                        setBloodType(type);
                        setShowBloodTypes(false);
                      }}
                    >
                      <Text
                        style={{
                          color: bloodType === type ? "#fff" : theme.text,
                          fontWeight: "800",
                        }}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <Text style={[styles.label, { color: theme.text }]}>Email *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Unesi email"
                placeholderTextColor={theme.subtext}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                returnKeyType="next"
              />

              <Text style={[styles.label, { color: theme.text }]}>Šifra *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Unesi šifru"
                placeholderTextColor={theme.subtext}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCorrect={false}
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />

              <Text style={[styles.label, { color: theme.text }]}>Potvrdi šifru *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Ponovo unesi šifru"
                placeholderTextColor={theme.subtext}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCorrect={false}
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />

              <Pressable
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: loading ? 0.7 : 1,
                  },
                ]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Registracija..." : "Registruj se"}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.secondaryButton, { backgroundColor: theme.badge }]}
                onPress={() => router.replace("/login")}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: theme.badgeText },
                  ]}
                >
                  Već imaš nalog? Prijavi se
                </Text>
              </Pressable>
            </View>
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
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 80,
  },
  headerBox: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#d1fae5",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  dateButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  bloodTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  bloodTypeButton: {
    width: "23%",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  successMessage: {
    color: "green",
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "600",
  },
  errorMessage: {
    color: "red",
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "600",
  },
});