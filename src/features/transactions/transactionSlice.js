import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch all transactions
export const getTransactions = createAsyncThunk(
  "transaction/getTransactions",
  async ({ query, page = 0, size = 10, sortField = 'id', sortOrder = 'asc' }, { rejectWithValue }) => {
    try {
      const sortOrderSymbol = sortOrder === 'asc' ? `+${sortField}` : `-${sortField}`;
      const response = await axios.get("https://quanbeo.duckdns.org/api/v1/transactions/all", {
        params: { query, page, size, sort: sortOrderSymbol }
      });

      return {
        transactions: response.data.data.data,
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch transactions.");
    }
  }
);

// Async thunk to fetch transaction statistics
export const getTransactionStatistics = createAsyncThunk(
  "transaction/getTransactionStatistics",
  async (projectId, { rejectWithValue }) => {
    try {
      const url = "https://quanbeo.duckdns.org/api/v1/transactions/statistic";
      const params = projectId ? { projectId } : {};

      const response = await axios.get(url, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch transaction statistics.");
    }
  }
);

// Async thunk to fetch projects for dropdown
export const getProjects = createAsyncThunk(
  "transaction/getProjects",
  async (_, { rejectWithValue }) => {
    try {
      // Extract unique projects from transactions
      const response = await axios.get("https://quanbeo.duckdns.org/api/v1/transactions/all", {
        params: { size: 100 } // Get a large number to extract all projects
      });

      const transactions = response.data.data.data || [];
      const uniqueProjects = [...new Map(transactions.map(item =>
        [item.projectId, { id: item.projectId, title: item.projectTitle }]
      )).values()];

      // Log all project titles
      console.log("Fetched project titles:", uniqueProjects.map(project => project.title));

      return uniqueProjects;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch projects.");
    }
  }
);

const transactionSlice = createSlice({
  name: "transaction",
  initialState: {
    transactions: [],
    totalPages: 1,
    status: "idle",
    error: null,
    statistics: {
      totalAmount: 0,
      totalStripeFee: 0,
      totalPlatformFee: 0,
      totalProfit: 0,
      totalInvestor: 0,
      totalTransaction: 0
    },
    statsStatus: "idle",
    statsError: null,
    projects: [],
    projectsStatus: "idle",
    selectedProjectId: null
  },
  reducers: {
    setSelectedProject: (state, action) => {
      state.selectedProjectId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetching transactions
      .addCase(getTransactions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.transactions = action.payload.transactions;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "An error occurred while fetching the transactions.";
      })

      // Fetching transaction statistics
      .addCase(getTransactionStatistics.pending, (state) => {
        state.statsStatus = "loading";
        state.statsError = null;
      })
      .addCase(getTransactionStatistics.fulfilled, (state, action) => {
        state.statsStatus = "succeeded";
        state.statistics = action.payload;
      })
      .addCase(getTransactionStatistics.rejected, (state, action) => {
        state.statsStatus = "failed";
        state.statsError = action.payload || "An error occurred while fetching statistics.";
      })

      // Fetching projects
      .addCase(getProjects.pending, (state) => {
        state.projectsStatus = "loading";
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.projectsStatus = "succeeded";
        state.projects = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.projectsStatus = "failed";
      });
  },
});

export const { setSelectedProject } = transactionSlice.actions;
export default transactionSlice.reducer;