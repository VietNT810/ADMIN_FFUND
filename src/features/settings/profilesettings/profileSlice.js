import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Lấy userId từ localStorage
const getUserId = () => {
  return localStorage.getItem('userId') || null;
};

// Lấy accessToken từ localStorage
const getAccessToken = () => {
  return localStorage.getItem('accessToken') || null;
};

// Tạo action bất đồng bộ để fetch profile
export const fetchUserProfile = createAsyncThunk('profile/fetchUserProfile', async (_, { rejectWithValue }) => {
  const userId = getUserId();
  const token = getAccessToken();

  if (!userId || !token) {
    return rejectWithValue('User ID or Token not found');
  }

  try {
    const response = await axios.get(`http://103.162.15.61:8080/api/v1/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: '*/*',
      },
    });

    if (response.data.status === 200) {
      return response.data.data;
    } else {
      return rejectWithValue(response.data.message);
    }
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: {
      id: '',
      fullName: '',
      email: '',
      telephoneNumber: '',
      identifyNumber: '',
      userInformation: '',
      roles: '',
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default profileSlice.reducer;
