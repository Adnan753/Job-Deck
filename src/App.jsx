import { useState } from 'react';
import Landing from './Landing.jsx';
import Dashboard from './Dashboard.jsx';
import AuthGate from './AuthGate.jsx';

export default function App() {
  const [view, setView] = useState('landing');

  if (view === 'landing') {
    return <Landing onLaunchDashboard={() => setView('dashboard')} />;
  }

  return (
    <AuthGate>
      {(session) => <Dashboard session={session} onExitToLanding={() => setView('landing')} />}
    </AuthGate>
  );
}
