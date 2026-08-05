import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginRequest, LoginQrRequest, PerfilResponse, TokenResponse } from '../../types/auth';
import { authService } from '../../services/authService';

const initialToken = localStorage.getItem('token');
const initialRefreshToken = localStorage.getItem('refreshToken');

const initialState: AuthState = {
  user: null,
  token: initialToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  TokenResponse,
  LoginRequest,
  { rejectValue: string }
>('auth/loginUser', async (credenciales, { rejectWithValue, dispatch }) => {
  try {
    const tokens = await authService.login(credenciales);
    localStorage.setItem('token', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    // Cargar inmediatamente el perfil del usuario autenticado
    dispatch(fetchUserProfile());
    return tokens;
  } catch (error: any) {
    const msg = error.response?.data?.errores?.[0]?.mensaje || error.message || 'Error al iniciar sesión';
    return rejectWithValue(msg);
  }
});

export const loginQrUser = createAsyncThunk<
  TokenResponse,
  LoginQrRequest,
  { rejectValue: string }
>('auth/loginQrUser', async (request, { rejectWithValue, dispatch }) => {
  try {
    const tokens = await authService.loginQr(request);
    localStorage.setItem('token', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    dispatch(fetchUserProfile());
    return tokens;
  } catch (error: any) {
    const msg = error.response?.data?.errores?.[0]?.mensaje || error.message || 'Error al autenticar con QR';
    return rejectWithValue(msg);
  }
});

export const fetchUserProfile = createAsyncThunk<
  PerfilResponse,
  void,
  { rejectValue: string }
>('auth/fetchUserProfile', async (_, { rejectWithValue }) => {
  try {
    const perfil = await authService.getPerfil();
    return perfil;
  } catch (error: any) {
    const msg = error.response?.data?.errores?.[0]?.mensaje || error.message || 'Error al obtener perfil';
    return rejectWithValue(msg);
  }
});

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await authService.logout();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login con Credenciales
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Fallo de autenticación';
      });

    // Login con QR
    builder
      .addCase(loginQrUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginQrUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginQrUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Fallo al autenticar con QR';
      });

    // Carga de Perfil
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.isLoading = false;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { setTokens, clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
