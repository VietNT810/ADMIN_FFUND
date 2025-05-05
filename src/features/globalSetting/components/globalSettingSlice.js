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
                state.error = action.payload;
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
                state.error = action.payload;
            });
    }
});

export const { resetStatus } = globalSettingSlice.actions;

export default globalSettingSlice.reducer;