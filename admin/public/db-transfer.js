// Import button wiring, shared by every admin page's nav (see index.html /
// logs.html). Export is just a plain <a href="/api/db" download> link — no
// JS needed for that half.
document.getElementById('importDbFile')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!confirm(`Replace the current database with "${file.name}"? This can't be undone.`)) {
    e.target.value = '';
    return;
  }
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'content-type': 'application/octet-stream' },
      body: file,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || res.statusText);
    }
    alert('Import complete — reloading.');
    window.location.reload();
  } catch (err) {
    alert(`Import failed: ${err.message}`);
  } finally {
    e.target.value = '';
  }
});
