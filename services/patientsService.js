import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase/config";

export const getDoctorPatients = async (doctorId) => {
    try {
        const relationQuery = query(
            collection(db, "doctorPatients"),
            where("doctorId", "==", doctorId)
        );

        const relationSnapshot = await getDocs(relationQuery);
        const patients = [];

        for (const relationDoc of relationSnapshot.docs) {
            const relation = relationDoc.data();

            const patientRef = doc(db, "users", relation.patientId);
            const patientSnap = await getDoc(patientRef);

            if (!patientSnap.exists()) continue;

            const recordsQuery = query(
                collection(db, "medicalRecords"),
                where("patientId", "==", patientSnap.id)
            );

            const recordsSnapshot = await getDocs(recordsQuery);

            const hasActiveTherapy = recordsSnapshot.docs.some(
                (recordDoc) => recordDoc.data().therapyStatus === "aktivna"
            );

            patients.push({
                id: patientSnap.id,
                ...patientSnap.data(),
                therapyStatus: hasActiveTherapy ? "aktivna" : "završena",
            });
        }

        return patients;
    } catch {
        return [];
    }
};

export const addPatientToDoctor = async (
    doctorId,
    patientEmail,
    specialization
) => {
    const normalizedEmail = patientEmail.trim().toLowerCase();

    const patientQuery = query(
        collection(db, "users"),
        where("email", "==", normalizedEmail),
        where("role", "==", "pacijent")
    );

    const patientSnapshot = await getDocs(patientQuery);

    if (patientSnapshot.empty) {
        throw new Error("Pacijent sa ovim emailom ne postoji.");
    }

    const patientDoc = patientSnapshot.docs[0];
    const patientId = patientDoc.id;
    const relationId = `${doctorId}_${patientId}`;

    await setDoc(doc(db, "doctorPatients", relationId), {
        doctorId,
        patientId,
        specialization: specialization || "",
        createdBy: "doctor",
        createdAt: new Date().toISOString(),
    });
};