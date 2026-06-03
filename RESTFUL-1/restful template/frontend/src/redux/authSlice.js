import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser, logoutUser, signupUser } from "../services/authApi";
import { apiError } from "../services/api";
import { clearAuth, loadAuth, saveAuth } from "../utils/authStorage";

const stored = loadAuth();

export const login = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try {
    return await loginUser(data);
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const signup = createAsyncThunk("auth/signup", async (data, { rejectWithValue }) => {
  try {
    return await signupUser(data);
  } catch (error) {
    return rejectWithValue(apiError(error));
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, { getState }) => {
  const { refreshToken } = getState().auth;
  if (refreshToken) await logoutUser(refreshToken).catch(() => {});
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: stored.user || null,
    accessToken: stored.accessToken || null,
    refreshToken: stored.refreshToken || null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      saveAuth({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      });
    },
    clearSession: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      clearAuth();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        saveAuth(action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        saveAuth(action.payload);
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        clearAuth();
      });
  },
});

export const { clearSession, setUser } = authSlice.actions;
export default authSlice.reducer;
