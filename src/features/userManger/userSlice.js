import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Get All User
export const getUsersContent = createAsyncThunk(
  "user/getUsersContent",
  async ({ query, page = 0, size = 12, sortField = "id", sortOrder = "asc", roles, active }, { rejectWithValue }) => {
    try {
      const sortOrderSymbol = sortOrder === "asc" ? `+${sortField}` : `-${sortField}`;
      const response = await axios.get("https://quanbeo.duckdns.org/api/v1/user", {
        params: { query, page, size, sort: sortOrderSymbol, roles, active },
      });

      return {
        users: response.data.data.data,
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || "Failed to fetch users.");
    }
  }
);

// Add new Manager
export const addManager = createAsyncThunk(
  'user/addManager',
  async (newManager, { rejectWithValue }) => {
    try {
      const formattedManager = {
        fullName: newManager.fullName,
        username: newManager.username,
        password: newManager.password,
        phone: newManager.phone,
      };

      const response = await axios.post('https://quanbeo.duckdns.org/api/v1/user/manager', formattedManager);

      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add manager.');
    }
  }
);

// Get User by ID
export const getUserById = createAsyncThunk(
  'user/getUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/user/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch user by ID.');
    }
  }
);

// ✅ Ban user
export const banUser = createAsyncThunk(
  "user/banUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`https://quanbeo.duckdns.org/api/v1/user/ban/${userId}`);
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || "Failed to ban user.");
    }
  }
);

// ✅ Unban user
export const unbanUser = createAsyncThunk(
  "user/unbanUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`https://quanbeo.duckdns.org/api/v1/user/unban/${userId}`);
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message || "Failed to unban user.");
    }
  }
);

// ✅ Redux Slice
const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    totalPages: 1,
    error: null,
    status: "idle",
    banStatus: "",
    unbanStatus: "",
    user: null,
  },
  reducers: {
    resetBanUnbanStatus: (state) => {
      state.banStatus = "";
      state.unbanStatus = "";
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    resetState: (state) => {
      state.users = [];
      state.totalPages = 1;
      state.error = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All
      .addCase(getUsersContent.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUsersContent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload.users;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getUsersContent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Get User by Id
      .addCase(getUserById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Ban
      .addCase(banUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(banUser.fulfilled, (state, action) => {
        state.banStatus = action.payload;
        state.users = state.users.map((user) =>
          user.id === action.meta.arg ? { ...user, active: true } : user
        );
      })
      .addCase(banUser.rejected, (state, action) => {
        state.banStatus = `Error: ${action.payload}`;
      })
      // Unban
      .addCase(unbanUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(unbanUser.fulfilled, (state, action) => {
        state.unbanStatus = action.payload;
        state.users = state.users.map((user) =>
          user.id === action.meta.arg ? { ...user, active: false } : user
        );
      })
      .addCase(unbanUser.rejected, (state, action) => {
        state.unbanStatus = `Error: ${action.payload}`;
      })
      // Add Manager
      .addCase(addManager.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addManager.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users.push(action.payload);
      })
      .addCase(addManager.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetBanUnbanStatus, setUsers, resetState } = userSlice.actions;

export default userSlice.reducer;
