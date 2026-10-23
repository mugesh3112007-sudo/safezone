import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGuardStore = create(
  persist(
    (set) => ({
      guardId: null,
      guardName: '',
      eventId: null,
      status: 'available', // available, busy, offline
      alerts: [],

      setGuard: (data) => set({
        guardId: data.guardId || data.guard_id,
        guardName: data.guardName || data.name || 'Guard',
        eventId: data.eventId || data.event_id,
        status: data.status || 'available'
      }),

      clearGuard: () => set({
        guardId: null,
        guardName: '',
        eventId: null,
        status: 'offline',
        alerts: []
      }),

      setStatus: (status) => set({ status }),

      setAlerts: (alerts) => set({ alerts }),

      updateAlert: (alertId, update) => set((state) => ({
        alerts: state.alerts.map(a => (a.id === alertId || a._id === alertId) ? { ...a, ...update } : a)
      }))
    }),
    {
      name: 'safezone-guard-storage'
    }
  )
);
