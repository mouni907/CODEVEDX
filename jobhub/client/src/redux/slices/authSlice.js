import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
const initialState = {
    token: localStorage.getItem('token'),
    user: null,
    loading: false,
    error: null,
    success: false,
};
// Async Thunks
export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/register', userData);
        localStorage.setItem('token', response.data.token);
        return response.data;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
});
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/login', credentials);
        localStorage.setItem('token', response.data.token);
        return response.data;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
});
export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/auth/profile');
        return response.data;
    }
    catch (err) {
        localStorage.removeItem('token');
        return rejectWithValue(err.response?.data?.message || 'Session expired');
    }
});
export const updateUserProfile = createAsyncThunk('auth/updateProfile', async (formData, { rejectWithValue }) => {
    try {
        const response = await api.put('/auth/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
});
export const changeUserPassword = createAsyncThunk('auth/changePassword', async (passwordData, { rejectWithValue }) => {
    try {
        const response = await api.put('/auth/change-password', passwordData);
        return response.data;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to change password');
    }
});
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            state.token = null;
            state.user = null;
            state.success = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // REGISTER
            .addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(registerUser.fulfilled, (state, action) => {
            state.loading = false;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.success = true;
        })
            .addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // LOGIN
            .addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.success = true;
        })
            .addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // LOAD USER
            .addCase(loadUser.pending, (state) => {
            state.loading = true;
        })
            .addCase(loadUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
        })
            .addCase(loadUser.rejected, (state, action) => {
            state.loading = false;
            state.token = null;
            state.user = null;
        })
            // UPDATE PROFILE
            .addCase(updateUserProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.success = true;
        })
            .addCase(updateUserProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // CHANGE PASSWORD
            .addCase(changeUserPassword.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        })
            .addCase(changeUserPassword.fulfilled, (state) => {
            state.loading = false;
            state.success = true;
        })
            .addCase(changeUserPassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { logout, clearError, clearSuccess } = authSlice.actions;
export default authSlice.reducer;
