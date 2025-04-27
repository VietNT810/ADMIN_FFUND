import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get all criteria
export const getAllCriteria = createAsyncThunk(
  'criteria/getAllCriteria',
  async ({ query, page = 0, size = 10, sortField = 'id', sortOrder = 'asc' }, { rejectWithValue }) => {
    try {
      const sortOrderSymbol = sortOrder === 'asc' ? `+${sortField}` : `-${sortField}`;
      const response = await axios.get('https://quanbeo.duckdns.org/api/v1/criteria/all', {
        params: { query, page, size, sort: sortOrderSymbol }
      });

      return {
        criteriaList: response.data.data.data,
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch Criteria.');
    }
  }
);

// Get all criteria type
export const getAllCriteriaType = createAsyncThunk(
  'criteria/getAllCriteriaType',
  async (_, { rejectWithValue }) => {
      try {
          const response = await axios.get('https://quanbeo.duckdns.org/api/v1/criteria-type/all');
          return response.data.data;
      } catch (error) {
          return rejectWithValue(error.response?.data?.error || 'Failed to fetch criteria type.');
      }
  }
);

// Get criteria by ID
export const getCriteriaById = createAsyncThunk(
  'criteria/getCriteriaById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/criteria/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch criteria by ID.');
    }
  }
);

// Get criteria type by ID
export const getCriteriaTypeById = createAsyncThunk(
  'criteria/getCriteriaTypeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/criteria-type/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch criteria type by ID.');
    }
  }
);

// Create new criteria type
export const createCriteriaType = createAsyncThunk(
  'criteria/createCriteriaType',
  async (newCriteriaType, { rejectWithValue }) => {
    try {
      const formattedCriteriaType = {
        name: newCriteriaType.name,
        description: newCriteriaType.description,
      };

      const response = await axios.post('https://quanbeo.duckdns.org/api/v1/criteria-type', formattedCriteriaType);

      return response.data.message;
    } catch (error) {
      if (error.response?.data?.error && typeof error.response?.data?.error === 'object') {
        let errorMessages = [];
        for (const [field, message] of Object.entries(error.response?.data?.error)) {
          errorMessages.push(`${field}: ${message}`);
        }
        return rejectWithValue(errorMessages.join(', '));
      }
      return rejectWithValue(error.response?.data?.error || 'Failed to create criteria type.');
    }
  }
);

// Get criteria all details by criteria ID
export const getCriteriaAllDetail = createAsyncThunk(
    'criteria/getCriteriaAllDetail',
    async (id, { rejectWithValue }) => {
      try {
        const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/criteria/detail/all/${id}`);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.error || 'Failed to fetch criteria all details.');
      }
    }
);

// Get detail criteria by detail ID
export const getCriteriaDetailById = createAsyncThunk(
    'criteria/getCriteriaDetailById',
    async (detailId , { rejectWithValue }) => {
      try {
        const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/criteria/detail/${detailId}`);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.error || 'Failed to fetch criteria details by ID.');
      }
    }
);

// Post new criteria
export const createCriteria = createAsyncThunk(
  'criteria/createCriteria',
  async (newCriteria, { rejectWithValue }) => {
    try {
      const formattedCriteria = {
        maximumPoint: newCriteria.maximumPoint,
        typeId: newCriteria.typeId,
        description: newCriteria.description,
        categoryId: newCriteria.categoryId,
      };

      const response = await axios.post('https://quanbeo.duckdns.org/api/v1/criteria', formattedCriteria);

      return response.data.message;
    } catch (error) {
      if (error.response?.data?.error && typeof error.response?.data?.error === 'object') {
        let errorMessages = [];
        for (const [field, message] of Object.entries(error.response?.data?.error)) {
          errorMessages.push(`${field}: ${message}`);
        }
        return rejectWithValue(errorMessages.join(', '));
      }
      return rejectWithValue(error.response?.data?.error || 'Failed to create criteria.');
    }
  }
);

// Post new detail criteria
export const createDetailCriteria = createAsyncThunk(
    'criteria/createDetailCriteria',
    async (newDetailCriteria, { rejectWithValue }) => {
      try {
        const formattedCriteria = {
            basicRequirement: newDetailCriteria.basicRequirement,
            evaluationCriteria: newDetailCriteria.evaluationCriteria,
            maxPoint: newDetailCriteria.maxPoint,
        };
  
        const response = await axios.post(`https://quanbeo.duckdns.org/api/v1/criteria/detail/${newDetailCriteria.id}`, formattedCriteria);
  
        return response.data.message;
      } catch (error) {
        return rejectWithValue(error.response?.data?.error || 'Failed to create detail criteria.');
      }
    }
);

// Update criteria
export const updateCriteria = createAsyncThunk(
    'criteria/updateCriteria',
    async (updateCriteria, { rejectWithValue }) => {
      try {
        const formattedCriteria = {
          maximumPoint: updateCriteria.maximumPoint,
          description: updateCriteria.description,
        };

        const response = await axios.put(`https://quanbeo.duckdns.org/api/v1/criteria/${updateCriteria.id}`, formattedCriteria);
  
        return response.data.message;
      } catch (error) {
        if (error.response?.data?.error && typeof error.response?.data?.error === 'object') {
          let errorMessages = [];
          for (const [field, message] of Object.entries(error.response?.data?.error)) {
            errorMessages.push(`${field}: ${message}`);
          }
          return rejectWithValue(errorMessages.join(', '));
        }
        return rejectWithValue(error.response?.data?.error || 'Failed to update criteria.');
      }
    }
);

// Update detail criteria
export const updateDetailCriteria = createAsyncThunk(
    'criteria/updateDetailCriteria',
    async (updateDetailCriteria, { rejectWithValue }) => {
      try {
        const formattedCriteria = {
            basicRequirement: updateDetailCriteria.basicRequirement,
            evaluationCriteria: updateDetailCriteria.evaluationCriteria,
            maxPoint: updateDetailCriteria.maxPoint,
        };
  
        const response = await axios.put(`https://quanbeo.duckdns.org/api/v1/criteria/detail/update/${updateDetailCriteria.id}`, formattedCriteria);
  
        return response.data.message;
      } catch (error) {
        return rejectWithValue(error.response?.data?.error || 'Failed to update detail criteria.');
      }
    }
);

// Delete criteria
export const deleteCriteria = createAsyncThunk(
    'criteria/deleteCriteria',
    async (criteriaId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`https://quanbeo.duckdns.org/api/v1/criteria/delete/${criteriaId}`);
            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete criteria.');
        }
    }
);

// Delete detail criteria
export const deleteDetailCriteria = createAsyncThunk(
    'criteria/deleteDetailCriteria',
    async (detailId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`https://quanbeo.duckdns.org/api/v1/criteria/detail/delete/${detailId}`);
            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete criteria.');
        }
    }
);

const criteriaSlice = createSlice({
  name: 'criteria',
  initialState: {
    criteriaList: [],
    currentCriteria: null,
    currentCriteriaDetail: null,
    currentCriteriaType: null,
    criteriaTypes: [],
    status: 'idle',
    error: null,
    totalPages: 1,
  },
  reducers: {
    resetState: (state) => {
      state.criteriaList = [];
      state.error = null;
      state.status = 'idle';
      state.currentCriteriaDetail = null;
      state.criteriaTypes = [];
      state.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all criteria
      .addCase(getAllCriteria.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getAllCriteria.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.criteriaList = action.payload.criteriaList;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getAllCriteria.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Get all criteria types
      .addCase(getAllCriteriaType.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getAllCriteriaType.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.criteriaTypes = action.payload;
      })
      .addCase(getAllCriteriaType.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Get criteria by ID
      .addCase(getCriteriaById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCriteriaById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentCriteria = action.payload;
      })
      .addCase(getCriteriaById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Get criteria type by ID
      .addCase(getCriteriaTypeById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCriteriaTypeById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentCriteriaType = action.payload;
      })
      .addCase(getCriteriaTypeById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create new criteria type
      .addCase(createCriteriaType.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createCriteriaType.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.criteriaTypes.push(action.payload);
      })
      .addCase(createCriteriaType.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Get criteria all details
      .addCase(getCriteriaAllDetail.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCriteriaAllDetail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentCriteriaDetail = action.payload;
      })
      .addCase(getCriteriaAllDetail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Get Criteria Detail By Detail ID
      .addCase(getCriteriaDetailById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCriteriaDetailById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentCriteriaDetail = action.payload;
      })
      .addCase(getCriteriaDetailById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create new criteria
      .addCase(createCriteria.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createCriteria.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.criteriaList.push(action.payload);
      })
      .addCase(createCriteria.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create new detail criteria
      .addCase(createDetailCriteria.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createDetailCriteria.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentCriteriaDetail.push(action.payload);
      })
      .addCase(createDetailCriteria.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update criteria
      .addCase(updateCriteria.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCriteria.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.criteriaList.findIndex((criteria) => criteria.id === action.payload.id);
        if (index >= 0) {
          state.criteriaList[index] = action.payload;
        }
      })
      .addCase(updateCriteria.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update detail criteria
      .addCase(updateDetailCriteria.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateDetailCriteria.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.currentCriteriaDetail.findIndex((detail) => detail.id === action.payload.id);
        if (index >= 0) {
          state.currentCriteriaDetail[index] = action.payload;
        }
      })
      .addCase(updateDetailCriteria.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete criteria
      .addCase(deleteCriteria.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteCriteria.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.criteriaList = state.criteriaList.filter((criteria) => criteria.id !== action.payload.id);
      })
      .addCase(deleteCriteria.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete detail criteria
      .addCase(deleteDetailCriteria.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteDetailCriteria.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentCriteriaDetail = state.currentCriteriaDetail.filter((detail) => detail.id !== action.payload.id);
      })
      .addCase(deleteDetailCriteria.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetState } = criteriaSlice.actions;

export default criteriaSlice.reducer;
