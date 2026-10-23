import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  event: null,
  zones: [],
  guards: [],
  alerts: [],
  incidents: [],
  kpis: {
    activeAttendees: 342,
    avgResponseTime: 42,
    qrScansToday: 1250,
    falseAlarmRate: 2.1,
    activeAlerts: 1
  },
  crowdWarnings: [],

  setEvent: (event) => set({ event }),
  setZones: (zones) => set({ zones }),
  setGuards: (guards) => set({ guards }),
  setAlerts: (alerts) => set({ alerts }),
  setIncidents: (incidents) => set({ incidents }),
  setKPIs: (kpis) => set((state) => ({ kpis: { ...state.kpis, ...kpis } })),
  addCrowdWarning: (warning) => set((state) => ({
    crowdWarnings: [warning, ...state.crowdWarnings]
  })),
  removeCrowdWarning: (id) => set((state) => ({
    crowdWarnings: state.crowdWarnings.filter(w => w.id !== id)
  }))
}));
