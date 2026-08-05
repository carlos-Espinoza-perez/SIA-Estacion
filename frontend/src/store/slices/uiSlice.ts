import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationItem {
  id: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  mensaje: string;
  duracionMs?: number;
}

interface UiState {
  sidebarOpen: boolean;
  rightSidebarOpen: boolean;
  theme: 'dark' | 'light';
  notificaciones: NotificationItem[];
}

const initialState: UiState = {
  sidebarOpen: true,
  rightSidebarOpen: true,
  theme: 'dark',
  notificaciones: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleRightSidebar: (state) => {
      state.rightSidebarOpen = !state.rightSidebarOpen;
    },
    setRightSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.rightSidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<NotificationItem, 'id'>>) => {
      const id = Math.random().toString(36).substring(2, 9);
      state.notificaciones.push({ ...action.payload, id });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notificaciones = state.notificaciones.filter((n) => n.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleRightSidebar,
  setRightSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
