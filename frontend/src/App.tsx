import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppRouter } from './router/AppRouter';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/organisms/ErrorBoundary/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
