import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for syncing state with localStorage
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if nothing in storage
 * @returns {[*, function, function]} [value, setValue, clearValue]
 */
export function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Clear function
  const clearValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error clearing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setStoredValue, clearValue];
}

/**
 * Save a named design to localStorage
 * @param {string} name - Design name
 * @param {object} design - Design data
 */
export function saveDesign(name, design) {
  try {
    const designs = JSON.parse(localStorage.getItem('hexlight-designs') || '{}');
    designs[name] = {
      ...design,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('hexlight-designs', JSON.stringify(designs));
    return true;
  } catch (error) {
    console.warn('Error saving design:', error);
    return false;
  }
}

/**
 * Load all saved designs from localStorage
 * @returns {object} Object of named designs
 */
export function loadDesigns() {
  try {
    return JSON.parse(localStorage.getItem('hexlight-designs') || '{}');
  } catch (error) {
    console.warn('Error loading designs:', error);
    return {};
  }
}

/**
 * Delete a named design from localStorage
 * @param {string} name - Design name to delete
 */
export function deleteDesign(name) {
  try {
    const designs = JSON.parse(localStorage.getItem('hexlight-designs') || '{}');
    delete designs[name];
    localStorage.setItem('hexlight-designs', JSON.stringify(designs));
    return true;
  } catch (error) {
    console.warn('Error deleting design:', error);
    return false;
  }
}
