import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

/**
 * Loading Context Provider
 * Provides centralized loading state management across the entire application.
 * Supports multiple concurrent loading states with automatic cleanup.
 */

const LoadingContext = createContext(null);

// Loading state types for semantic usage
export const LOADING_TYPES = {
  APP_INIT: 'app-init',
  AUTH: 'auth',
  NAVIGATION: 'navigation',
  DATA_FETCH: 'data-fetch',
  FORM_SUBMIT: 'form-submit',
  ACTION: 'action'
};

export function LoadingProvider({ children }) {
  // Track multiple loading states by key
  const [loadingStates, setLoadingStates] = useState({});
  
  // Global app initialization state
  const [isAppReady, setIsAppReady] = useState(false);

  /**
   * Start a loading state with a unique key
   * @param {string} key - Unique identifier for the loading state
   * @param {string} type - Type of loading (from LOADING_TYPES)
   * @param {string} message - Optional message to display
   */
  const startLoading = useCallback((key, type = LOADING_TYPES.DATA_FETCH, message = '') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { type, message, startTime: Date.now() }
    }));
  }, []);

  /**
   * Stop a specific loading state
   * @param {string} key - The key of the loading state to stop
   */
  const stopLoading = useCallback((key) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  /**
   * Check if a specific loading state is active
   * @param {string} key - The key to check
   */
  const isLoading = useCallback((key) => {
    return Boolean(loadingStates[key]);
  }, [loadingStates]);

  /**
   * Check if any loading of a specific type is active
   * @param {string} type - The type to check
   */
  const isLoadingType = useCallback((type) => {
    return Object.values(loadingStates).some(state => state.type === type);
  }, [loadingStates]);

  /**
   * Get the message for a specific loading state
   * @param {string} key - The key of the loading state
   */
  const getLoadingMessage = useCallback((key) => {
    return loadingStates[key]?.message || '';
  }, [loadingStates]);

  /**
   * Check if any loading state is active
   */
  const isAnyLoading = useMemo(() => {
    return Object.keys(loadingStates).length > 0;
  }, [loadingStates]);

  /**
   * Mark app as ready (called after initial load)
   */
  const markAppReady = useCallback(() => {
    setIsAppReady(true);
  }, []);

  /**
   * Clear all loading states (useful for error recovery)
   */
  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  const value = useMemo(() => ({
    loadingStates,
    isAppReady,
    startLoading,
    stopLoading,
    isLoading,
    isLoadingType,
    getLoadingMessage,
    isAnyLoading,
    markAppReady,
    clearAllLoading
  }), [
    loadingStates,
    isAppReady,
    startLoading,
    stopLoading,
    isLoading,
    isLoadingType,
    getLoadingMessage,
    isAnyLoading,
    markAppReady,
    clearAllLoading
  ]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

/**
 * Custom hook to use loading context
 */
export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

/**
 * Custom hook for component-level loading with automatic cleanup
 * @param {string} key - Unique key for this component's loading state
 */
export function useComponentLoading(key) {
  const { startLoading, stopLoading, isLoading, getLoadingMessage } = useLoading();

  const start = useCallback((message = '') => {
    startLoading(key, LOADING_TYPES.DATA_FETCH, message);
  }, [key, startLoading]);

  const stop = useCallback(() => {
    stopLoading(key);
  }, [key, stopLoading]);

  const loading = isLoading(key);
  const message = getLoadingMessage(key);

  return { start, stop, loading, message };
}

export default LoadingContext;
