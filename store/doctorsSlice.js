import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    createDoctor,
    deleteDoctor,
    getUsersByRole,
} from "../services/adminService";

const initialState = {
    doctors: [],
    loading: false,
    error: null,
};

export const fetchDoctors = createAsyncThunk(
    "doctors/fetchDoctors",
    async () => {
        const data = await getUsersByRole("lekar");
        return data;
    }
);

export const createDoctorThunk = createAsyncThunk(
    "doctors/createDoctor",
    async (doctorData) => {
        await createDoctor(doctorData);

        const updatedDoctors = await getUsersByRole("lekar");
        return updatedDoctors;
    }
);

export const deleteDoctorThunk = createAsyncThunk(
    "doctors/deleteDoctor",
    async (doctorId) => {
        await deleteDoctor(doctorId);

        const updatedDoctors = await getUsersByRole("lekar");
        return updatedDoctors;
    }
);

const doctorsSlice = createSlice({
    name: "doctors",
    initialState,

    reducers: {},

    extraReducers: (builder) => {
        builder

            // FETCH
            .addCase(fetchDoctors.pending, (state) => {
                state.loading = true;
            })

            .addCase(fetchDoctors.fulfilled, (state, action) => {
                state.loading = false;
                state.doctors = action.payload;
            })

            .addCase(fetchDoctors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // CREATE
            .addCase(createDoctorThunk.fulfilled, (state, action) => {
                state.doctors = action.payload;
            })

            // DELETE
            .addCase(deleteDoctorThunk.fulfilled, (state, action) => {
                state.doctors = action.payload;
            });
    },
});

export default doctorsSlice.reducer;