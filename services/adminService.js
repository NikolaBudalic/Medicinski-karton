import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where
} from "firebase/firestore";
import { db, secondaryAuth } from "../firebase/config";

export const getUsersByRole = async (role) => {
    const q = query(collection(db, "users"), where("role", "==", role));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
    }));
};

export const getPatientById = async (patientId) => {
    const patientRef = doc(db, "users", patientId);
    const patientSnap = await getDoc(patientRef);

    if (!patientSnap.exists()) return null;

    return {
        id: patientSnap.id,
        ...patientSnap.data(),
    };
};

export const getPatientDoctors = async (patientId) => {
    const q = query(
        collection(db, "doctorPatients"),
        where("patientId", "==", patientId)
    );

    const snapshot = await getDocs(q);

    const doctors = [];

    for (const relationDoc of snapshot.docs) {
        const relation = relationDoc.data();

        const doctorRef = doc(db, "users", relation.doctorId);
        const doctorSnap = await getDoc(doctorRef);

        if (doctorSnap.exists()) {
            doctors.push({
                relationId: relationDoc.id,
                ...relation,
                doctor: {
                    id: doctorSnap.id,
                    ...doctorSnap.data(),
                },
            });
        }
    }

    return doctors;
};

export const removeDoctorFromPatient = async (relationId) => {
    await deleteDoc(doc(db, "doctorPatients", relationId));
};
export const addDoctorToPatient = async (patientId, doctor) => {
    const existingDoctors = await getPatientDoctors(patientId);

    const alreadyHasSpecialization = existingDoctors.some(
        (item) =>
            item.doctor?.specialization === doctor.specialization ||
            item.specialization === doctor.specialization
    );

    if (alreadyHasSpecialization) {
        throw new Error("Pacijent već ima lekara ove specijalizacije.");
    }

    await setDoc(doc(db, "doctorPatients", `${doctor.id}_${patientId}`), {
        doctorId: doctor.id,
        patientId,
        specialization: doctor.specialization || "",
        createdBy: "admin",
        createdAt: new Date().toISOString(),
    });
};

export const createDoctor = async ({ firstName, lastName, email, password, specialization }) => {
    const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
    );

    const doctor = userCredential.user;

    await setDoc(doc(db, "users", doctor.uid), {
        firstName,
        lastName,
        email,
        specialization,
        role: "lekar",
        createdAt: new Date().toISOString(),
    });

    await signOut(secondaryAuth);
};

export const updateDoctor = async (doctorId, doctorData) => {
    await updateDoc(doc(db, "users", doctorId), {
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        specialization: doctorData.specialization,
        updatedAt: new Date().toISOString(),
    });
};

export const deleteDoctor = async (doctorId) => {
    const q = query(
        collection(db, "doctorPatients"),
        where("doctorId", "==", doctorId)
    );

    const snapshot = await getDocs(q);

    for (const relationDoc of snapshot.docs) {
        await deleteDoc(doc(db, "doctorPatients", relationDoc.id));
    }

    await deleteDoc(doc(db, "users", doctorId));
};