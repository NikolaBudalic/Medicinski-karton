import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase/config";

export const addMedicalRecord = async (recordData) => {
    await addDoc(collection(db, "medicalRecords"), {
        ...recordData,
        createdAt: new Date().toISOString(),
    });
};

export const getPatientMedicalRecords = async (patientId) => {
    const q = query(
        collection(db, "medicalRecords"),
        where("patientId", "==", patientId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
    }));
};

export const getDoctorAppointments = async (doctorId) => {
    const q = query(
        collection(db, "medicalRecords"),
        where("doctorId", "==", doctorId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
    }));
};

export const updateMedicalRecord = async (recordId, newData) => {
    await updateDoc(doc(db, "medicalRecords", recordId), {
        ...newData,
        updatedAt: new Date().toISOString(),
    });
};

export const deleteMedicalRecord = async (recordId) => {
    await deleteDoc(doc(db, "medicalRecords", recordId));
};