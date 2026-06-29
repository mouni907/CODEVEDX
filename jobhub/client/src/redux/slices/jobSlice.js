import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
const initialState = {
    jobs: [],
    jobDetails: null,
    myJobs: [],
    loading: false,
    error: null,
    success: false,
};
// Async Thunks
export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (filters, { rejectWithValue }) => {
    try {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.search)
                params.append('search', filters.search);
            if (filters.location && filters.location !== 'All')
                params.append('location', filters.location);
            if (filters.category && filters.category !== 'All')
                params.append('category', filters.category);
            if (filters.employmentType && filters.employmentType !== 'All')
                params.append('employmentType', filters.employmentType);
        }
        const response = await api.get(`/jobs?${params.toString()}`);
        return response.data.jobs;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch jobs');
    }
});
export const fetchJobDetails = createAsyncThunk('jobs/fetchJobDetails', async (jobId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/jobs/${jobId}`);
        return response.data.job;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch job details');
    }
});
export const fetchMyJobs = createAsyncThunk('jobs/fetchMyJobs', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/jobs/my-jobs');
        return response.data.jobs;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch your jobs');
    }
});
export const postJob = createAsyncThunk('jobs/postJob', async (jobData, { rejectWithValue }) => {
    try {
        const response = await api.post('/jobs', jobData);
        return response.data.job;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to post job');
    }
});
export const editJob = createAsyncThunk('jobs/editJob', async ({ jobId, jobData }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/jobs/${jobId}`, jobData);
        return response.data.job;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to edit job');
    }
});
export const removeJob = createAsyncThunk('jobs/removeJob', async (jobId, { rejectWithValue }) => {
    try {
        await api.delete(`/jobs/${jobId}`);
        return jobId;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete job');
    }
});
const jobSlice = createSlice({
    name: 'jobs',
    initialState,
    reducers: {
        clearJobError: (state) => {
            state.error = null;
        },
        clearJobSuccess: (state) => {
            state.success = false;
        },
        resetJobDetails: (state) => {
            state.jobDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH ALL JOBS
            .addCase(fetchJobs.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchJobs.fulfilled, (state, action) => {
            state.loading = false;
            state.jobs = action.payload;
        })
            .addCase(fetchJobs.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // FETCH JOB DETAILS
            .addCase(fetchJobDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchJobDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.jobDetails = action.payload;
        })
            .addCase(fetchJobDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // FETCH MY POSTED JOBS (EMPLOYER)
            .addCase(fetchMyJobs.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchMyJobs.fulfilled, (state, action) => {
            state.loading = false;
            state.myJobs = action.payload;
        })
            .addCase(fetchMyJobs.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // POST NEW JOB
            .addCase(postJob.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        })
            .addCase(postJob.fulfilled, (state, action) => {
            state.loading = false;
            state.myJobs.unshift(action.payload);
            state.success = true;
        })
            .addCase(postJob.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // EDIT JOB
            .addCase(editJob.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        })
            .addCase(editJob.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.myJobs.findIndex((j) => j.id === action.payload.id);
            if (index !== -1) {
                state.myJobs[index] = action.payload;
            }
            state.jobDetails = action.payload;
            state.success = true;
        })
            .addCase(editJob.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // DELETE JOB
            .addCase(removeJob.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        })
            .addCase(removeJob.fulfilled, (state, action) => {
            state.loading = false;
            state.myJobs = state.myJobs.filter((j) => j.id !== action.payload);
            state.success = true;
        })
            .addCase(removeJob.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { clearJobError, clearJobSuccess, resetJobDetails } = jobSlice.actions;
export default jobSlice.reducer;
