import Nav        from '@/components/Nav';
import Hero       from '@/components/Hero';
import Experience from '@/components/Experience';
import Posts      from '@/components/Posts';
import HostName   from '@/components/HostName';

export const metadata = {
  title:       'Elliot Singer — IT Engineer & Self-Hosting Enthusiast',
  description: 'Portfolio and blog of Elliot Singer — devops / infra engineer and homelab enthusiast.',
};

const FOOTER_LINKS = [
  { href: 'https://status.singer.systems',        label: 'status'   },
  { href: 'https://github.com/elsing',            label: 'github'   },
  { href: 'https://linkedin.com/in/elliotsinger', label: 'linkedin' },
  { href: 'mailto:elliot@singer.systems',         label: 'email'    },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <Nav />
      <Hero />

      {/* Lower grid — 50/50 */}
      <div className="relative z-10 border-t border-white/[0.07] grid grid-cols-1 lg:grid-cols-2 max-w-[1440px] mx-auto">
        <div className="border-b lg:border-b-0 lg:border-r border-white/[0.07]">
          <Experience />
        </div>
        <Posts />
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.07] px-5 sm:px-10 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 max-w-[1440px] mx-auto">
        <span className="font-mono text-[12px] text-site-muted text-center sm:text-left">
          © {new Date().getFullYear()} elliot singer · singer.systems<HostName />
        </span>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
          {FOOTER_LINKS.map(({ href, label }) => (
            <a key={label} href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="footer-link font-mono text-[12px] text-site-muted-hi no-underline transition-colors">
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
