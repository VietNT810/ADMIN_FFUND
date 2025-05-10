import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getViolationsByManager = createAsyncThunk(
    "violation/getViolationsByManager",
    async (projectId, { rejectWithValue }) => {
      try {
        const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/violations/project/${projectId}/manager`);
        console.log("API Response:", response.data); 
        return response.data.data || [];
      } catch (error) {
        return rejectWithValue(error.response?.data?.error || "Failed to fetch violations.");
      }
    }
  );

export const getViolationById = createAsyncThunk(
    "violation/getViolationById",
    async (violationId, { rejectWithValue }) => {
        try {
        const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/violations/${violationId}`);
        return response.data.data || null;
        } catch (error) {
        return rejectWithValue(error.response?.data?.error || "Failed to fetch violation.");
        }
    }
);

export const createViolation = createAsyncThunk(
    "violation/createViolation",
    async ({ projectId, violationData, evidenceFile }, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(
                `https://quanbeo.duckdns.org/api/v1/violations/project/${projectId}`, 
                violationData
            );
            
            const violationId = response.data.data;

            if (evidenceFile) {
                try {
                    await dispatch(postEvidence({
                        violationId,
                        evidence: { file: evidenceFile }
                    })).unwrap();
                } catch (evidenceError) {
                    console.error("Failed to upload evidence:", evidenceError);
                }
            }
            const violationResponse = await axios.get(
                `https://quanbeo.duckdns.org/api/v1/violations/${violationId}`
            );
            
            return violationResponse.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to create violation.");
        }
    }
);

export const updateViolation = createAsyncThunk(
    "violation/updateViolation",
    async ({ violationId, updatedViolation }, { rejectWithValue }) => {
        try {
            const payload = {
                ...updatedViolation,
                description: updatedViolation.description?.trim() || ''
            };

            if (!payload.description) {
                return rejectWithValue("Description cannot be empty");
            }
            
            const response = await axios.put(
                `https://quanbeo.duckdns.org/api/v1/violations/${violationId}`, 
                payload
            );

            const updatedResponse = await axios.get(
                `https://quanbeo.duckdns.org/api/v1/violations/${violationId}`
            );
            
            return updatedResponse.data.data || null;
        } catch (error) {
            console.error("Update violation error:", error);
            if (error.response?.data?.error) {
                if (typeof error.response.data.error === 'object') {
                    const errorMessages = [];
                    for (const key in error.response.data.error) {
                        errorMessages.push(`${key}: ${error.response.data.error[key]}`);
                    }
                    return rejectWithValue(errorMessages.join(", "));
                } 
                return rejectWithValue(error.response.data.error);
            }
            
            return rejectWithValue(error.message || "Failed to update violation");
        }
    }
);


export const deleteViolation = createAsyncThunk(
    "violation/deleteViolation",
    async (violationId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`https://quanbeo.duckdns.org/api/v1/violations/${violationId}`);
            return violationId; 
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to delete violation.");
        }
    }
);

export const postEvidence = createAsyncThunk(
    "violation/postEvidence",
    async ({ violationId, evidence }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("file", evidence.file); 

            const response = await axios.patch(`https://quanbeo.duckdns.org/api/v1/violations/${violationId}/evidence`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data.data || null;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || "Failed to upload evidence.");
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

const violationSlice = createSlice({
    name: "violation",
    initialState: {
        violations: [],
        status: "idle",
        error: null,
    },
    reducers: {
        // Add this reducer
        resetViolations: (state) => {
            state.violations = [];
            state.status = "idle";
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getViolationsByManager.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getViolationsByManager.fulfilled, (state, action) => {
                state.status = "succeeded";
                console.log("Action payload in reducer:", action.payload);
                
                if (Array.isArray(action.payload)) {
                    state.violations = action.payload;
                } else if (action.payload && typeof action.payload === 'object') {
                    if (Array.isArray(action.payload.data)) {
                        state.violations = action.payload.data;
                    } else {
                        state.violations = [action.payload]; 
                    }
                } else {
                    state.violations = []; 
                }
                console.log("Violations set in state:", state.violations);
            })
            .addCase(getViolationsByManager.rejected, (state, action) => {
                state.status = "failed";
                state.error = formatErrorMessage(action.payload);
            })
            .addCase(getViolationById.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getViolationById.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.violations.findIndex(violation => violation.id === action.payload.id);
                if (index !== -1) {
                    state.violations[index] = action.payload;
                }
            })
            .addCase(getViolationById.rejected, (state, action) => {
                state.status = "failed";
                state.error = formatErrorMessage(action.payload);
            })
            .addCase(createViolation.pending, (state) => {
                state.status = "loading";
            })
            .addCase(createViolation.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.violations.push(action.payload);
            })
            .addCase(createViolation.rejected, (state, action) => {
                state.status = "failed";
                state.error = formatErrorMessage(action.payload);
            })
            .addCase(updateViolation.pending, (state) => {
                state.status = "loading";
            })
            .addCase(updateViolation.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.violations.findIndex(violation => violation.id === action.payload.id);
                if (index !== -1) {
                    state.violations[index] = action.payload;
                }
            })
            .addCase(updateViolation.rejected, (state, action) => {
                state.status = "failed";
                state.error = formatErrorMessage(action.payload);
            })
            .addCase(deleteViolation.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteViolation.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.violations = state.violations.filter(violation => violation.id !== action.payload);
            })
            .addCase(deleteViolation.rejected, (state, action) => {
                state.status = "failed";
                state.error = formatErrorMessage(action.payload);
            })  
            .addCase(postEvidence.pending, (state) => {
                state.status = "loading";
            })
            .addCase(postEvidence.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.violations.findIndex(violation => violation.id === action.payload.id);
                if (index !== -1) {
                    state.violations[index] = action.payload;
                }
            })
            .addCase(postEvidence.rejected, (state, action) => {
                state.status = "failed";
                state.error = formatErrorMessage(action.payload);
            });
    },
});


export default violationSlice.reducer;
export const { resetViolations } = violationSlice.actions;