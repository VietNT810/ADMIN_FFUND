import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all global settings
export const fetchGlobalSettings = createAsyncThunk(
    'globalSettings/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('https://quanbeo.duckdns.org/api/v1/settings');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch global settings');
        }
    }
);

// Update a specific global setting
export const updateGlobalSetting = createAsyncThunk(
    'globalSettings/update',
    async ({ id, value }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`https://quanbeo.duckdns.org/api/v1/settings/${id}`, {
                value
            });

            return { id, value, message: response.data.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update global setting');
        }
    }
);

export const fetchGlobalSettingsByType = createAsyncThunk(
    'globalSettings/fetchByType',
    async (types, { rejectWithValue }) => {
        try {
            // Convert array to comma-separated string if needed
            const typeParams = Array.isArray(types) ? types.join(',') : types;
            const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/settings/all/by-type?types=${typeParams}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch global settings by type');
        }
    }
);

const formatErrorMessage = (error) => {
    if (!error) return "Unknown error";

    if (typeof error === 'string') return error;

    if (typeof error === 'object') {
        // Handle object with error properties
        if (error.description) return `Description: ${error.description}`;

        // Convert object to string representation
        return Object.entries(error)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    }

    return String(error);
};

const initialState = {
    settings: [],
    status: 'idle',
    error: null,
};

const globalSettingSlice = createSlice({
    name: 'globalSettings',
    initialState,
    reducers: {
        resetStatus: (state) => {
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all settings cases
            .addCase(fetchGlobalSettings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchGlobalSettings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.settings = action.payload;
            })
            .addCase(fetchGlobalSettings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = formatErrorMessage(action.payload);
            })

            // Update setting cases
            .addCase(updateGlobalSetting.pending, (state) => {
                state.status = 'updating';
            })
            .addCase(updateGlobalSetting.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const settingIndex = state.settings.findIndex(setting => setting.id === action.payload.id);
                if (settingIndex !== -1) {
                    state.settings[settingIndex].value = action.payload.value;
                }
            })
            .addCase(updateGlobalSetting.rejected, (state, action) => {
                state.status = 'failed';
                state.error = formatErrorMessage(action.payload);
            })
            .addCase(fetchGlobalSettingsByType.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchGlobalSettingsByType.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Merge with existing settings or replace if same type exists
                action.payload.forEach(newSetting => {
                    const existingIndex = state.settings.findIndex(s => s.id === newSetting.id);
                    if (existingIndex !== -1) {
                        state.settings[existingIndex] = newSetting;
                    } else {
                        state.settings.push(newSetting);
                    }
                })
            })
            .addCase(fetchGlobalSettingsByType.rejected, (state, action) => {
                state.status = 'failed';
                state.error = formatErrorMessage(action.payload);
            })
    }
});

export const { resetStatus } = globalSettingSlice.actions;

export default globalSettingSlice.reducer;