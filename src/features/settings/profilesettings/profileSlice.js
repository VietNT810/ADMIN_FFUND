import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getAdminProfile = createAsyncThunk(
  'profile/getAdminProfile', 
  async (_, { rejectWithValue }) => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      return rejectWithValue('User ID is not available');
    }

    try {
      const response = await axios.get(`https://quanbeo.duckdns.org/api/v1/user/${userId}`);
      return response.data; // Trả về dữ liệu người dùng
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch Admin Account.');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAdminProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(getAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default profileSlice.reducer;
