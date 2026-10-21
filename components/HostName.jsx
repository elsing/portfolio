'use client';
import { useEffect, useState } from 'react';

export default function HostName() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    fetch('/api/host').then(r => r.json()).then(setInfo).catch(() => {});
  }, []);
  if (!info) return null;
  return (
    <>
      <span className="hidden sm:inline">{' · '}</span>
      <span className="block sm:inline whitespace-nowrap">served by {info.host}{info.k8s && ' (k8s)'}</span>
    </>
  );
}
