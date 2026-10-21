import os from 'node:os';

export const dynamic = 'force-dynamic';

// K8s sets KUBERNETES_SERVICE_HOST in every pod, and the hostname is the pod
// name (deployment-rshash-suffix) — show just the suffix.
export function GET() {
  const k8s = !!process.env.KUBERNETES_SERVICE_HOST;
  const host = os.hostname();
  return Response.json({ host: k8s ? host.split('-').pop() : host, k8s });
}
