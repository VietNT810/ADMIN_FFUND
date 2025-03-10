import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ✅ Fetch projects from API with search and sort parameters
export const getProjects = createAsyncThunk(
  'project/getProjects',
  async ({ query, page = 0, size = 10, sortField = 'id', sortOrder = 'asc' }, { rejectWithValue }) => {
    try {
      const sortOrderSymbol = sortOrder === 'asc' ? `+${sortField}` : `-${sortField}`;
      const response = await axios.get('http://103.162.15.61:8080/api/v1/project/search', {
        params: { query, page, size, sort: sortOrderSymbol }
      });

      return {
        projects: response.data.data.data,
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects.');
    }
  }
);

// ✅ Redux Slice for Project
const projectSlice = createSlice({
  name: 'project',
  initialState: {
    projects: [],
    totalPages: 1,
    error: null,
    status: 'idle',
  },
  reducers: {
    // Set projects directly (useful after update)
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload.projects;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// ✅ Export Actions
export const { setProjects } = projectSlice.actions;

// ✅ Export Reducer
export default projectSlice.reducer;
