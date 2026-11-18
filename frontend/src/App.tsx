import { useCallback, useState } from 'react';
import { isHostedDemo } from './api/demo';
import AuthScreen from './AuthScreen';
import Workspace from './Workspace';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('docai_token') ?? '');
  const [sessionMessage, setSessionMessage] = useState('');

  const endSession = useCallback((reason = '') => {
    localStorage.removeItem('docai_token');
    setSessionMessage(reason);
    setToken('');
  }, []);

  function startSession(nextToken: string) {
    localStorage.setItem('docai_token', nextToken);
    setSessionMessage('');
    setToken(nextToken);
  }

  if (!isHostedDemo && !token) {
    return <AuthScreen initialMessage={sessionMessage} onAuthenticated={startSession} />;
  }
  return <Workspace key={token} onSignOut={endSession} />;
}
