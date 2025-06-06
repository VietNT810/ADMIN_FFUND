import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://ffund.duckdns.org/api/v1';

export const getEvaluationThresholds = createAsyncThunk(
    'evaluation/getEvaluationThresholds',
    async (_, { rejectWithValue }) => {
        try {
            const [passResponse, excellentResponse, resubmitResponse] = await Promise.all([
                axios.get(`${BASE_URL}/settings/type?type=PASS_PERCENTAGE`),
                axios.get(`${BASE_URL}/settings/type?type=PASS_EXCELLENT_PERCENTAGE`),
                axios.get(`${BASE_URL}/settings/type?type=RESUBMIT_PERCENTAGE`)
            ]);

            return {
                passPercentage: passResponse.data.data.value,
                excellentPercentage: excellentResponse.data.data.value,
                resubmitPercentage: resubmitResponse.data.data.value
            };
        } catch (error) {
            console.error('API Error fetching thresholds:', error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch evaluation thresholds');
        }
    }
);

export const getProjectEvaluations = createAsyncThunk(
    'evaluation/getProjectEvaluations',
    async (projectId, { rejectWithValue }) => {
        try {
            console.log('Fetching evaluations for project:', projectId);
            const response = await axios.get(`${BASE_URL}/evaluation/grade/${projectId}`);
            console.log('API Response:', response.data);

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
            console.log('Fetching investments for phase:', phaseId);

            // Build URL with query parameters
            const response = await axios.get(`${BASE_URL}/investment/all/${phaseId}`, {
                params: {
                    query,
                    page,
                    size,
                    sort: sortOrderSymbol
                }
            });

            console.log('Investment API response:', response.data);
            return response.data;
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

export const refundBannedProjectByPhaseId = createAsyncThunk(
    'evaluation/refundBannedProjectByPhaseId',
    async ({ phaseId }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/investment/refund/${phaseId}`);
            return response.data;
        } catch (error) {
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

export const getProjectPaymentInformationByProjectId = createAsyncThunk(
    'evaluation/getProjectPaymentInformationByProjectId',
    async (projectId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/project-payment-information/by-project-id/${projectId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Failed to fetch project payment information';
            return rejectWithValue({
                status: error.response?.status,
                error: errorMessage
            });
        }
    }
);

export const payoutCompletedPhase = createAsyncThunk(
    'evaluation/payoutCompletedPhase',
    async ({ phaseId }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/payout/phase/${phaseId}`);
            return response.data;
        } catch (error) {
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
    evaluations: [],
    evaluationItems: [],
    status: 'idle',
    error: null,
    successMessage: null,
    thresholds: {
        passPercentage: 0.7,
        excellentPercentage: 0.9,
        resubmitPercentage: 0.3
    },
    thresholdsLoaded: false
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
            .addCase(getEvaluationThresholds.pending, (state) => {
            })
            .addCase(getEvaluationThresholds.fulfilled, (state, action) => {
                state.thresholds = {
                    passPercentage: action.payload.passPercentage,
                    excellentPercentage: action.payload.excellentPercentage,
                    resubmitPercentage: action.payload.resubmitPercentage
                };
                state.thresholdsLoaded = true;
                console.log('Evaluation thresholds loaded:', state.thresholds);
            })
            .addCase(getEvaluationThresholds.rejected, (state, action) => {
                console.error('Failed to load evaluation thresholds:', action.payload);
            })

            .addCase(getProjectEvaluations.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                console.log('Redux - getProjectEvaluations.pending: Setting status to loading');
            })
            .addCase(getProjectEvaluations.fulfilled, (state, action) => {
                console.log('Redux - getProjectEvaluations.fulfilled: Action received', action);

                state.status = 'succeeded';

                const evaluationsArray = Array.isArray(action.payload) ? action.payload : [];
                console.log('Redux - Processing evaluations array:', evaluationsArray);

                state.evaluations = evaluationsArray.map(evaluation => ({
                    ...evaluation,
                    componentName: formatComponentName(evaluation.typeName)
                }));

                console.log('Redux - Updated state.evaluations:', state.evaluations);

                if (state.evaluations.length === 0) {
                    console.warn('Redux WARNING: evaluations array is empty after processing!');
                }
            })
            .addCase(getProjectEvaluations.rejected, (state, action) => {
                state.status = 'failed';
                state.error = formatErrorMessage(action.payload) || 'Failed to fetch evaluations';
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
                state.error = formatErrorMessage(action.payload) || 'Failed to fetch evaluation items';
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
                state.error = formatErrorMessage(action.payload) || 'Failed to update comment';
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
                state.error = formatErrorMessage(action.payload) || 'Failed to update grade';
            })

            .addCase(getProjectEvaluationsAfter.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                console.log('Redux - getProjectEvaluationsAfter.pending: Setting status to loading');
            })
            .addCase(getProjectEvaluationsAfter.fulfilled, (state, action) => {
                console.log('Redux - getProjectEvaluationsAfter.fulfilled: Action received', action);
                state.status = 'succeeded';

                const evaluationsArray = Array.isArray(action.payload) ? action.payload : [];
                console.log('Redux - Processing founder evaluations array:', evaluationsArray);

                const founderEvaluations = evaluationsArray.map(evaluation => ({
                    ...evaluation,
                    componentName: formatComponentName(evaluation.typeName)
                }));

                state.evaluations = founderEvaluations;

                console.log('Redux - Updated state.evaluations with founder data:', state.evaluations);
            })
            .addCase(getProjectEvaluationsAfter.rejected, (state, action) => {
                state.status = 'failed';
                state.error = formatErrorMessage(action.payload) || 'Failed to fetch founder evaluations';
                console.log('Redux - getProjectEvaluationsAfter.rejected:', action.payload);
            })

            .addCase(getPhaseInvesment.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getPhaseInvesment.fulfilled, (state, action) => {
                state.status = 'succeeded';

                if (action.payload?.data?.data && Array.isArray(action.payload.data.data)) {
                    state.phaseInvestments = action.payload.data.data;
                } else {
                    state.phaseInvestments = action.payload || [];
                }

                if (action.payload?.currentPage !== undefined) {
                    state.pagination = {
                        currentPage: action.payload.currentPage,
                        totalPages: action.payload.totalPages,
                        pageSize: action.payload.pageSize,
                        totalElements: action.payload.totalElements
                    };
                }
            })
            .addCase(getPhaseInvesment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = formatErrorMessage(action.payload) || 'Failed to fetch phase investments';
            })
            .addCase(approveUnderReviewProject.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(approveUnderReviewProject.rejected, (state, action) => {
                state.status = 'failed';
                if (action.payload && action.payload.error) {
                    state.error = formatErrorMessage(action.payload);
                } else {
                    state.error = action.error.message || 'Failed to approve project';
                }
            })
            .addCase(approveUnderReviewProject.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.successMessage = action.payload.message || 'Project approved successfully';
            })
            .addCase(refundBannedProjectByPhaseId.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(refundBannedProjectByPhaseId.rejected, (state, action) => {
                state.status = 'failed';
                if (action.payload && action.payload.error) {
                    state.error = formatErrorMessage(action.payload);
                } else {
                    state.error = action.error.message || 'Failed to approve project';
                }
            })
            .addCase(refundBannedProjectByPhaseId.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.successMessage = action.payload.message || 'Project approved successfully';
            })
            .addCase(getProjectPaymentInformationByProjectId.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getProjectPaymentInformationByProjectId.rejected, (state, action) => {
                state.status = 'failed';
                if (action.payload && action.payload.error) {
                    state.error = formatErrorMessage(action.payload);
                } else {
                    state.error = action.error.message || 'Failed to approve project';
                }
            })
            .addCase(getProjectPaymentInformationByProjectId.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
    },
});

export const { clearError, clearSuccessMessage } = evaluationProjectSlice.actions;

export default evaluationProjectSlice.reducer;