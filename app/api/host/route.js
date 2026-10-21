import os from 'node:os';

export const dynamic = 'force-dynamic';

// In K8s the container hostname is the pod name (deployment-rshash-suffix);
// show just the suffix. Non-pod hostnames pass through untouched.
export function GET() {
  const host = os.hostname();
  const pod = host.match(/^.+-[a-z0-9]{6,10}-([a-z0-9]{5})$/);
  return Response.json({ host: pod ? pod[1] : host });
}
