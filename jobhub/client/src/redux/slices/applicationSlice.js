import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
const initialState = {
    applications: [],
    applicants: [],
    loading: false,
    error: null,
    success: false,
};
// Async Thunks
export const submitApplication = createAsyncThunk('applications/submit', async (formData, { rejectWithValue }) => {
    try {
        const response = await api.post('/applications/apply', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.application;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to submit application');
    }
});
export const fetchMyApplications = createAsyncThunk('applications/fetchMyApplications', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/applications/my-applications');
        return response.data.applications;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch your applications');
    }
});
export const fetchJobApplicants = createAsyncThunk('applications/fetchJobApplicants', async (jobId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/applications/applicants/${jobId}`);
        return response.data.applications;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch applicants for this job');
    }
});
export const updateApplicationStatus = createAsyncThunk('applications/updateStatus', async ({ applicationId, status }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/applications/status/${applicationId}`, { status });
        return response.data.application;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update application status');
    }
});
const applicationSlice = createSlice({
    name: 'applications',
    initialState,
    reducers: {
        clearApplicationError: (state) => {
            state.error = null;
        },
        clearApplicationSuccess: (state) => {
            state.success = false;
        },
        resetApplicantsList: (state) => {
            state.applicants = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // SUBMIT APPLICATION
            .addCase(submitApplication.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        })
            .addCase(submitApplication.fulfilled, (state, action) => {
            state.loading = false;
            state.applications.unshift(action.payload);
            state.success = true;
        })
            .addCase(submitApplication.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // FETCH MY APPLICATIONS (CANDIDATE)
            .addCase(fetchMyApplications.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchMyApplications.fulfilled, (state, action) => {
            state.loading = false;
            state.applications = action.payload;
        })
            .addCase(fetchMyApplications.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // FETCH JOB APPLICANTS (EMPLOYER)
            .addCase(fetchJobApplicants.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchJobApplicants.fulfilled, (state, action) => {
            state.loading = false;
            state.applicants = action.payload;
        })
            .addCase(fetchJobApplicants.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // UPDATE STATUS (EMPLOYER)
            .addCase(updateApplicationStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        })
            .addCase(updateApplicationStatus.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.applicants.findIndex((a) => a.id === action.payload.id);
            if (index !== -1) {
                state.applicants[index] = action.payload;
            }
            state.success = true;
        })
            .addCase(updateApplicationStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { clearApplicationError, clearApplicationSuccess, resetApplicantsList } = applicationSlice.actions;
export default applicationSlice.reducer;
