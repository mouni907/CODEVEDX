import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import jobReducer from './slices/jobSlice';
import companyReducer from './slices/companySlice';
import applicationReducer from './slices/applicationSlice';
export const store = configureStore({
    reducer: {
        auth: authReducer,
        jobs: jobReducer,
        companies: companyReducer,
        applications: applicationReducer,
    },
});
