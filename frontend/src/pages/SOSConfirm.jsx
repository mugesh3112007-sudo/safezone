import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SafetyCheck from '../components/SafetyCheck';
import { useAttendeeStore } from '../stores/attendeeStore';

export default function SOSConfirm() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const setAlert = useAttendeeStore((state) => state.setAlert);

  const handleTimeout = () => {
    const alertId = 'alt_' + Math.random().toString(36).substr(2, 9);
    setAlert(alertId, 'pending');
    navigate(`/e/${eventId || 'demo'}/alert/${alertId}`);
  };

  return <SafetyCheck onTimeout={handleTimeout} />;
}
