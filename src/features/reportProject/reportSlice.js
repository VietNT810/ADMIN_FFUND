import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch all Report
export const getAllReport = createAsyncThunk(
  'report/getAllReport',
  async ({ query, page = 0, size = 10, sortField = 'id', sortOrder = 'asc' }, { rejectWithValue }) => {
    try {
      const sortOrderSymbol = sortOrder === 'asc' ? `+${sortField}` : `-${sortField}`;
      const response = await axios.get('https://ffund.duckdns.org/api/v1/report-project/manager/all', {
        params: { query, page, size, sort: sortOrderSymbol },
      });

      return {
        projects: response.data.data.data,
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports.');
    }
  }
);

// Get report by ID
export const getReportById = createAsyncThunk(
  'report/getReportById',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://ffund.duckdns.org/api/v1/report-project/${reportId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch report by ID.');
    }
  }
);

export const approveReportForUnderReview = createAsyncThunk(
  'report/approveReportForUnderReview',
  async ({ reportId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `https://ffund.duckdns.org/api/v1/report-project/review/${reportId}`,
        data
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to approve report.');
    }
  }
);

// Response report
export const responseReport = createAsyncThunk(
  'report/responseReport',
  async ({ reportId, data }, { rejectWithValue }) => {
    try {
      const responseApi = await axios.post(
        `https://ffund.duckdns.org/api/v1/report-project/response/${reportId}`,
        data
      );

      return responseApi.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to respond to report.');
    }
  }
);

const initialState = {
  reports: [],
  report: null,
  totalPages: 0,
  loading: false,
  error: null,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle getAllReport async thunk
      .addCase(getAllReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.projects;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(getAllReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch reports.';
      })

      // Handle getReportById async thunk
      .addCase(getReportById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReportById.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
        state.error = null;
      })
      .addCase(getReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch report by ID.';
      })

      // Handle responseReport async thunk
      .addCase(responseReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(responseReport.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(responseReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to respond to report.';
      })
      // Handle approveReportForUnderReview async thunk
      .addCase(approveReportForUnderReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveReportForUnderReview.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(approveReportForUnderReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to approve report.';
      });
  },
});

export default reportSlice.reducer;
