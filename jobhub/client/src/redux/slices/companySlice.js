import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
const initialState = {
    companies: [],
    myCompany: null,
    companyDetails: null,
    loading: false,
    error: null,
    success: false,
};
// Async Thunks
export const fetchCompanies = createAsyncThunk('companies/fetchCompanies', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/companies');
        return response.data.companies;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch companies');
    }
});
export const fetchCompanyDetails = createAsyncThunk('companies/fetchCompanyDetails', async (companyId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/companies/${companyId}`);
        return response.data.company;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch company details');
    }
});
export const fetchMyCompany = createAsyncThunk('companies/fetchMyCompany', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/companies/my-company');
        return response.data.company;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch your company profile');
    }
});
export const saveCompanyProfile = createAsyncThunk('companies/saveProfile', async (formData, { rejectWithValue }) => {
    try {
        const response = await api.post('/companies', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.company;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to save company profile');
    }
});
const companySlice = createSlice({
    name: 'companies',
    initialState,
    reducers: {
        clearCompanyError: (state) => {
            state.error = null;
        },
        clearCompanySuccess: (state) => {
            state.success = false;
        },
        resetCompanyDetails: (state) => {
            state.companyDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH ALL COMPANIES
            .addCase(fetchCompanies.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchCompanies.fulfilled, (state, action) => {
            state.loading = false;
            state.companies = action.payload;
        })
            .addCase(fetchCompanies.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // FETCH SINGLE COMPANY DETAILS
            .addCase(fetchCompanyDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchCompanyDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.companyDetails = action.payload;
        })
            .addCase(fetchCompanyDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // FETCH MY COMPANY (EMPLOYER)
            .addCase(fetchMyCompany.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchMyCompany.fulfilled, (state, action) => {
            state.loading = false;
            state.myCompany = action.payload;
        })
            .addCase(fetchMyCompany.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // SAVE COMPANY PROFILE (CREATE/UPDATE)
            .addCase(saveCompanyProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        })
            .addCase(saveCompanyProfile.fulfilled, (state, action) => {
            state.loading = false;
            state.myCompany = action.payload;
            state.success = true;
        })
            .addCase(saveCompanyProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { clearCompanyError, clearCompanySuccess, resetCompanyDetails } = companySlice.actions;
export default companySlice.reducer;
