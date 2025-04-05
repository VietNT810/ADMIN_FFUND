import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch team content
export const getTeamContent = createAsyncThunk(
  "team/getTeamContent",
  async ({ page = 0, size = 9, sortField = "id", sortOrder = "asc" }, { rejectWithValue }) => {
    try {
      const sortOrderSymbol = sortOrder === "asc" ? `+${sortField}` : `-${sortField}`;
      const response = await axios.get("https://quanbeo.duckdns.org/api/v1/team", {
        params: { page, size, sort: sortOrderSymbol },
      });

      return {
        teams: response.data.data.data,
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch team.");
    }
  }
);

// Async thunk to fetch a team by ID
export const getTeamById = createAsyncThunk(
  "team/getTeamById",
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/team/${teamId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch team by ID.");
    }
  }
);

// Async thunk to fetch a member by ID
export const getMemberById = createAsyncThunk(
  "team/getMemberById",
  async (memberId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/team/member/detail/${memberId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch member by ID.");
    }
  }
);

const teamSlice = createSlice({
  name: "team",
  initialState: {
    teams: [],
    teamById: null,
    memberById: null,
    totalPages: 1,
    status: "idle",
    error: null,
  },
  reducers: {
    // You can define your additional actions here if necessary.
  },
  extraReducers: (builder) => {
    builder
      // Fetching teams
      .addCase(getTeamContent.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getTeamContent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.teams = action.payload.teams;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getTeamContent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "An error occurred while fetching the teams.";
      })
      
      // Fetching a single team by ID
      .addCase(getTeamById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getTeamById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.teamById = action.payload;
      })
      .addCase(getTeamById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "An error occurred while fetching the team.";
      })

      // Fetching a member by ID
      .addCase(getMemberById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getMemberById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.memberById = action.payload;
      })
      .addCase(getMemberById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "An error occurred while fetching the member.";
      });
  },
});

export default teamSlice.reducer;
