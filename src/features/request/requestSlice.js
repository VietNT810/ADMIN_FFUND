import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch all Request
export const getAllRequest = createAsyncThunk(
  'request/getAllRequest',
  async ({ query, page = 0, size = 10, sortField = 'id', sortOrder = 'asc' }, { rejectWithValue }) => {
    try {
      const sortOrderSymbol = sortOrder === 'asc' ? `+${sortField}` : `-${sortField}`;
      const response = await axios.get('https://ffund.duckdns.org/api/v1/request/all', {
        params: { query, page, size, sort: sortOrderSymbol },
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

// Get request by ID
export const getRequestById = createAsyncThunk(
  'request/getRequestById',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://ffund.duckdns.org/api/v1/request/${requestId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch request by ID.');
    }
  }
);

// Response request
export const responseRequest = createAsyncThunk(
  'request/responseRequest',
  async ({ requestId, response }, { rejectWithValue }) => {
    try {
      const responseApi = await axios.post(
        `https://ffund.duckdns.org/api/v1/request/respond/${requestId}`,
        { response }
      );
      return responseApi.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to respond to request.');
    }
  }
);

const initialState = {
  requests: [],
  request: null,
  totalPages: 0,
  loading: false,
  error: null,
};

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.projects;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(getAllRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch requests.';
      })
      .addCase(getRequestById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.request = action.payload;
        state.error = null;
      })
      .addCase(getRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch request by ID.';
      })
      .addCase(responseRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(responseRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(responseRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to respond to request.';
      });
  },
});

export default requestSlice.reducer;
