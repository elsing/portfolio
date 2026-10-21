'use client';
import HostName from './HostName';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] px-10 py-4 flex justify-between items-center">
      <span className="font-mono text-[12px] text-site-muted">
        © {new Date().getFullYear()} elliot singer · singer.systems<HostName />
      </span>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="font-mono text-[11px] text-site-muted hover:text-site-muted-hi transition-colors"
        aria-label="Back to top"
      >
        ↑ top
      </button>
    </footer>
  );
}
