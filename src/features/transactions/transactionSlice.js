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

const transactionSlice = createSlice({
  name: "transaction",
  initialState: {
    transactions: [],
    totalPages: 1,
    status: "idle",
    error: null,
  },
  reducers: {
    // You can define any additional actions here if necessary
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
      });
  },
});

export default transactionSlice.reducer;
