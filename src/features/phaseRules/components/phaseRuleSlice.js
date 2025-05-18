import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://ffund.duckdns.org/api/v1/rule';


export const fetchAllPhaseRules = createAsyncThunk(
    'phaseRules/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/all`);
            if (response.status === 200) {
                // Sort data by minTotal in ascending order
                const sortedData = response.data.data.sort((a, b) => a.minTotal - b.minTotal);
                return sortedData;
            }
            return rejectWithValue(response.data.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPhaseRuleById = createAsyncThunk(
    'phaseRules/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}`);
            return response.data.data; // Return the rule data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createPhaseRule = createAsyncThunk(
    'phaseRules/create',
    async (newRule, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_BASE_URL, newRule);
            return response.data; // Return the created rule
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updatePhaseRule = createAsyncThunk(
    'phaseRules/update',
    async ({ id, updatedRule }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${id}`, updatedRule);
            return response.data; // Return the updated rule
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Slice
const phaseRuleSlice = createSlice({
    name: 'phaseRules',
    initialState: {
        rules: [],
        rule: null,
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        // Handle fetchAllPhaseRules
        builder
            .addCase(fetchAllPhaseRules.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllPhaseRules.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.rules = action.payload;
            })
            .addCase(fetchAllPhaseRules.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // Handle fetchPhaseRuleById
        builder
            .addCase(fetchPhaseRuleById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPhaseRuleById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.rule = action.payload;
            })
            .addCase(fetchPhaseRuleById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // Handle createPhaseRule
        builder
            .addCase(createPhaseRule.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createPhaseRule.fulfilled, (state, action) => {
                state.status = 'succeeded';
                console.log('Rule created successfully:', action.payload.message);
            })
            .addCase(createPhaseRule.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // Handle updatePhaseRule
        builder
            .addCase(updatePhaseRule.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updatePhaseRule.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.rules.findIndex((rule) => rule.id === action.payload.id);
                if (index !== -1) {
                    state.rules[index] = action.payload;
                }
            })
            .addCase(updatePhaseRule.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default phaseRuleSlice.reducer;