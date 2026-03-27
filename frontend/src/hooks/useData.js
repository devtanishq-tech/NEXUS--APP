import { useState, useCallback } from 'react';
import { dataAPI } from '../services/api';

const useData = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  // ── Fetch all items ─────────────────────────────────────────────────────────
  const fetchItems = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await dataAPI.getAll(params);
      setItems(data.data || []);
      return { success: true, data: data.data };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Create item ─────────────────────────────────────────────────────────────
  const createItem = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await dataAPI.create(payload);
      setItems((prev) => [data.data, ...prev]);
      return { success: true, data: data.data };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Update item ─────────────────────────────────────────────────────────────
  const updateItem = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await dataAPI.update(id, payload);
      setItems((prev) => prev.map((item) => (item._id === id ? data.data : item)));
      return { success: true, data: data.data };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Delete item ─────────────────────────────────────────────────────────────
  const deleteItem = useCallback(async (id) => {
    setError(null);
    try {
      await dataAPI.delete(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  }, []);

  return {
    items,
    loading,
    error,
    clearError,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  };
};

export default useData;
