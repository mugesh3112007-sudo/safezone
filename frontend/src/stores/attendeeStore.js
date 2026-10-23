import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAttendeeStore = create(
  persist(
    (set) => ({
      sessionId: null,
      sessionToken: null,
      eventId: null,
      eventName: 'SafeZone Event',
      currentZone: 'Main Stage',
      alertId: null,
      alertStatus: null,
      isOnline: navigator.onLine,
      codeWord: 'pineapple',

      setSession: (data) => set({
        sessionId: data.sessionId || data.session_id,
        sessionToken: data.sessionToken || data.token,
        eventId: data.eventId || data.event_id,
        eventName: data.eventName || data.event_name || 'SafeZone Event',
        currentZone: data.currentZone || data.zone || 'Main Stage'
      }),

      clearSession: () => set({
        sessionId: null,
        sessionToken: null,
        eventId: null,
        eventName: '',
        currentZone: null,
        alertId: null,
        alertStatus: null
      }),

      setZone: (zone) => set({ currentZone: zone }),

      setAlert: (alertId, status = 'pending') => set({ alertId, alertStatus: status }),

      setAlertStatus: (status) => set({ alertStatus: status }),

      setOnline: (isOnline) => set({ isOnline })
    }),
    {
      name: 'safezone-attendee-storage'
    }
  )
);
