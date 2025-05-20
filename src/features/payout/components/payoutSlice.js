import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://ffund.duckdns.org/api/v1';

export const getPayoutByPhaseId = createAsyncThunk(
    'payout/getPayoutByPhaseId',
    async ({ phaseId }, { rejectWithValue }) => {
        try {
            console.log("PayoutSlice: Fetching payout for phaseId:", phaseId);
            const response = await axios.get(`${BASE_URL}/payout/${phaseId}`);
            console.log("PayoutSlice: Response received:", response.data);
            return response.data;
        } catch (error) {
            console.error("PayoutSlice: Error fetching data:", error.response || error);
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch payout information'
            );
        }
    }
);

const initialState = {
    payout: null,
    status: 'idle',
    error: null,
};

const payoutSlice = createSlice({
    name: 'payout',
    initialState,
    reducers: {
        clearPayoutData: (state) => {
            state.payout = null;
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPayoutByPhaseId.pending, (state) => {
                console.log("PayoutSlice: Request pending");
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getPayoutByPhaseId.fulfilled, (state, action) => {
                console.log("PayoutSlice: Request fulfilled with data:", action.payload);
                state.status = 'succeeded';
                state.payout = action.payload;
                state.error = null;
            })
            .addCase(getPayoutByPhaseId.rejected, (state, action) => {
                console.log("PayoutSlice: Request rejected with error:", action.payload);
                state.status = 'failed';
                state.error = action.payload || 'An error occurred';
            });
    }
});

export const { clearPayoutData } = payoutSlice.actions;
export default payoutSlice.reducer;