import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API Endpoints
const BASE_URL = 'https://ffund.duckdns.org/api/v1/admin/dashboard';

// Fetch system statistics
export const fetchSystemStatistics = createAsyncThunk(
    'dashboard/fetchSystemStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/system-static`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch transaction trend
export const fetchTransactionTrend = createAsyncThunk(
    'dashboard/fetchTransactionTrend',
    async ({ format, start, end }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/transaction-trend`, {
                params: { format, start, end },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch project trend
export const fetchProjectTrend = createAsyncThunk(
    'dashboard/fetchProjectTrend',
    async ({ format, start, end }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/project-trend`, {
                params: { format, start, end },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch category project trend
export const fetchCategoryProjectTrend = createAsyncThunk(
    'dashboard/fetchCategoryProjectTrend',
    async ({ format, start, end }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/category-project-trend`, {
                params: { format, start, end },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch category project percentage
export const fetchCategoryProjectPercentage = createAsyncThunk(
    'dashboard/fetchCategoryProjectPercentage',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/category-project-percentage`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch user growth
export const fetchUserGrowth = createAsyncThunk(
    'dashboard/fetchUserGrowth',
    async ({ format, start, end }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/user-growth`, {
                params: { format, start, end },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Initial state
const initialState = {
    systemStatistics: null,
    transactionTrend: [],
    projectTrend: [],
    categoryProjectTrend: [],
    categoryProjectPercentage: [],
    userGrowth: [],
    status: 'idle',
    error: null,
};

// Slice
const systemStaticSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // System Statistics
        builder
            .addCase(fetchSystemStatistics.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSystemStatistics.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.systemStatistics = action.payload;
            })
            .addCase(fetchSystemStatistics.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // Transaction Trend
        builder
            .addCase(fetchTransactionTrend.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTransactionTrend.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.transactionTrend = action.payload;
            })
            .addCase(fetchTransactionTrend.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // Project Trend
        builder
            .addCase(fetchProjectTrend.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProjectTrend.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.projectTrend = action.payload;
            })
            .addCase(fetchProjectTrend.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // Category Project Trend
        builder
            .addCase(fetchCategoryProjectTrend.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCategoryProjectTrend.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.categoryProjectTrend = action.payload;
            })
            .addCase(fetchCategoryProjectTrend.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // Category Project Percentage
        builder
            .addCase(fetchCategoryProjectPercentage.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCategoryProjectPercentage.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.categoryProjectPercentage = action.payload; // Save the data to state
            })
            .addCase(fetchCategoryProjectPercentage.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // User Growth
        builder
            .addCase(fetchUserGrowth.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserGrowth.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userGrowth = action.payload;
            })
            .addCase(fetchUserGrowth.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default systemStaticSlice.reducer;