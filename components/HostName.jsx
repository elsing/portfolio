'use client';
import { useEffect, useState } from 'react';

export default function HostName() {
  const [host, setHost] = useState('');
  useEffect(() => {
    fetch('/api/host').then(r => r.json()).then(d => setHost(d.host)).catch(() => {});
  }, []);
  return host ? ` · served by ${host}` : null;
}
