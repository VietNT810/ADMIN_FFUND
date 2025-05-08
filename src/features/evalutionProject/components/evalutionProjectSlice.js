import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://quanbeo.duckdns.org/api/v1';

export const getProjectEvaluations = createAsyncThunk(
    'evaluation/getProjectEvaluations',
    async (projectId, { rejectWithValue }) => {
        try {
            console.log('Fetching evaluations for project:', projectId);
            const response = await axios.get(`${BASE_URL}/evaluation/grade/${projectId}`);
            console.log('API Response:', response.data);

            // Return the data directly without additional processing
            const evaluationsData = response.data.data;
            console.log('Raw evaluations data being returned to reducer:', evaluationsData);
            return evaluationsData;
        } catch (error) {
            console.error('API Error:', error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch evaluations');
        }
    }
);

export const getEvaluationItems = createAsyncThunk(
    'evaluation/getEvaluationItems',
    async (evaluationId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/evaluation/item/${evaluationId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateEvaluationComment = createAsyncThunk(
    'evaluation/updateEvaluationComment',
    async ({ id, comment }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/evaluation/${id}`, { comment });
            return { id, comment, message: response.data.message };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateEvaluationGrade = createAsyncThunk(
    'evaluation/updateEvaluationGrade',
    async ({ itemId, point }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/evaluation/grade/${itemId}`, { point });
            return { itemId, point, message: response.data.message };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getProjectEvaluationsAfter = createAsyncThunk(
    'evaluation/getProjectEvaluationsAfter',
    async (projectId, { rejectWithValue }) => {
        try {
            console.log('Fetching evaluations for project:', projectId);
            const response = await axios.get(`${BASE_URL}/evaluation/founder/${projectId}`);
            console.log('API Response:', response.data);

            // Return the data directly without additional processing
            const evaluationsData = response.data.data;
            console.log('Raw evaluations data being returned to reducer:', evaluationsData);
            return evaluationsData;
        } catch (error) {
            console.error('API Error:', error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch evaluations');
        }
    }
);

export const getProjectEvaluationsLastest = createAsyncThunk(
    'evaluation/getProjectEvaluationsLatest',
    async (projectId, { rejectWithValue }) => {
        try {
            console.log('Fetching evaluations for project:', projectId);
            const response = await axios.get(`${BASE_URL}/evaluation/latest-graded/${projectId}`);
            console.log('API Response:', response.data);

            // Return the data directly without additional processing
            const evaluationsData = response.data.data;
            console.log('Raw evaluations data being returned to reducer:', evaluationsData);
            return evaluationsData;
        } catch (error) {
            console.error('API Error:', error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch evaluations');
        }
    }
);

export const getPhaseInvesment = createAsyncThunk(
    'evaluation/getPhaseInvesment',
    async ({ phaseId, query, page = 0, size = 10, sortField = 'id', sortOrder = 'asc' }, { rejectWithValue }) => {
        try {
            const sortOrderSymbol = sortOrder === 'asc' ? `+${sortField}` : `-${sortField}`;
            console.log('Fetching evaluations for phase:', phaseId);

            // Build URL with query parameters
            const response = await axios.get(`${BASE_URL}/investment/all/${phaseId}`, {
                params: {
                    query,
                    page,
                    size,
                    sort: sortOrderSymbol
                }
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const approveUnderReviewProject = createAsyncThunk(
    'evaluation/approveUnderReviewProject',
    async ({ projectId }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${BASE_URL}/project/approve/under-review/${projectId}`);
            return response.data;
        } catch (error) {
            // Properly extract the error structure
            const errorMessage = error.response?.data?.error || 
                                error.response?.data?.message || 
                                'Failed to approve project';
            
            return rejectWithValue({
                status: error.response?.status,
                error: errorMessage
            });
        }
    }
);


const initialState = {
    evaluations: [],
    evaluationItems: [],
    status: 'idle',
    error: null,
    successMessage: null,
};

function formatComponentName(typeName) {
    if (!typeName) return 'Unknown Component';
    return typeName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

const evaluationProjectSlice = createSlice({
    name: 'evaluation',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProjectEvaluations.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                console.log('Redux - getProjectEvaluations.pending: Setting status to loading');
            })
            .addCase(getProjectEvaluations.fulfilled, (state, action) => {
                console.log('Redux - getProjectEvaluations.fulfilled: Action received', action);

                state.status = 'succeeded';

                // Ensure we have an array, even if payload is null or undefined
                const evaluationsArray = Array.isArray(action.payload) ? action.payload : [];
                console.log('Redux - Processing evaluations array:', evaluationsArray);

                // Map and format component names
                state.evaluations = evaluationsArray.map(evaluation => ({
                    ...evaluation,
                    componentName: formatComponentName(evaluation.typeName)
                }));

                console.log('Redux - Updated state.evaluations:', state.evaluations);

                // This should NOT be empty if the API returned data
                if (state.evaluations.length === 0) {
                    console.warn('Redux WARNING: evaluations array is empty after processing!');
                }
            })
            .addCase(getProjectEvaluations.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to fetch evaluations';
                console.log('Redux - getProjectEvaluations.rejected:', action.payload);
            })

            .addCase(getEvaluationItems.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getEvaluationItems.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.evaluationItems = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(getEvaluationItems.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to fetch evaluation items';
            })

            .addCase(updateEvaluationComment.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateEvaluationComment.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.successMessage = 'Comment updated successfully';
                const index = state.evaluations.findIndex(evaluation => evaluation.id === action.payload.id);
                if (index !== -1) {
                    state.evaluations[index].comment = action.payload.comment;
                }
            })
            .addCase(updateEvaluationComment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to update comment';
            })

            .addCase(updateEvaluationGrade.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateEvaluationGrade.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.successMessage = 'Grade updated successfully';
                const index = state.evaluationItems.findIndex(item => item.id === action.payload.itemId);
                if (index !== -1) {
                    state.evaluationItems[index].actualPoint = action.payload.point;
                }
            })
            .addCase(updateEvaluationGrade.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to update grade';
            })

            // Add these cases to your extraReducers block in the evaluationProjectSlice:

            .addCase(getProjectEvaluationsAfter.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                console.log('Redux - getProjectEvaluationsAfter.pending: Setting status to loading');
            })
            .addCase(getProjectEvaluationsAfter.fulfilled, (state, action) => {
                console.log('Redux - getProjectEvaluationsAfter.fulfilled: Action received', action);
                state.status = 'succeeded';

                // Ensure we have an array, even if payload is null or undefined
                const evaluationsArray = Array.isArray(action.payload) ? action.payload : [];
                console.log('Redux - Processing founder evaluations array:', evaluationsArray);

                // Map and format component names for founder evaluations
                const founderEvaluations = evaluationsArray.map(evaluation => ({
                    ...evaluation,
                    componentName: formatComponentName(evaluation.typeName)
                }));

                // Add founder evaluations to state.evaluations
                state.evaluations = founderEvaluations;

                console.log('Redux - Updated state.evaluations with founder data:', state.evaluations);
            })
            .addCase(getProjectEvaluationsAfter.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to fetch founder evaluations';
                console.log('Redux - getProjectEvaluationsAfter.rejected:', action.payload);
            })

            .addCase(getPhaseInvesment.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getPhaseInvesment.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Store the investments data in evaluations array
                state.evaluations = action.payload.data || [];
                // Also store pagination info if needed
                state.pagination = {
                    currentPage: action.payload.currentPage,
                    totalPages: action.payload.totalPages,
                    pageSize: action.payload.pageSize,
                    totalElements: action.payload.totalElements
                };
            })
            .addCase(getPhaseInvesment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to fetch phase investments';
            })
            .addCase(approveUnderReviewProject.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(approveUnderReviewProject.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.successMessage = 'Project has been approved successfully!';
            })
            .addCase(approveUnderReviewProject.rejected, (state, action) => {
                state.status = 'failed';
                // Handle the structured error
                if (action.payload && action.payload.error) {
                    state.error = `${action.payload.error} (Status: ${action.payload.status || 'unknown'})`;
                } else {
                    state.error = action.error.message || 'Failed to approve project';
                }
            })
    },
});

export const { clearError, clearSuccessMessage } = evaluationProjectSlice.actions;

export default evaluationProjectSlice.reducer;