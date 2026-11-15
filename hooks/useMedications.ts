'use client';

import { useState, useEffect, useCallback } from 'react';
import { Medication } from '@/types';

export function useMedications(activeOnly: boolean = true) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedications = useCallback(async () => {
    try {
      const res = await fetch(`/api/medications?active=${activeOnly}`);
      if (res.ok) {
        const data = await res.json();
        setMedications(data.medications || []);
      }
    } catch (err) {
      console.error('[useMedications] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const addMedication = async (medData: any) => {
    const res = await fetch('/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medData),
    });
    const data = await res.json();
    if (res.ok) {
      await fetchMedications();
    }
    return data;
  };

  const deleteMedication = async (id: string) => {
    const res = await fetch(`/api/medications?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchMedications();
    }
    return res.ok;
  };

  return {
    medications,
    loading,
    refresh: fetchMedications,
    addMedication,
    deleteMedication,
  };
}
