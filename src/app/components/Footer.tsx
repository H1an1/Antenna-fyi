export function Footer() {
  return (
    <footer
      className="w-full px-6 md:px-12 py-4"
      style={{
        backgroundColor: "rgba(26, 20, 18, 0.9)",
        borderTop: "1px solid rgba(184, 173, 158, 0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px] text-[#b8ad9e]">
        <div className="flex items-center gap-1.5">
          <span>&copy; 2026 Antenna</span>
          <span>·</span>
          <a href="mailto:hi@antenna.fyi" className="hover:text-[#c4a862] transition-colors">hi@antenna.fyi</a>
        </div>
        <div className="flex items-center gap-1.5">
          <a href="https://x.com/thisishan1_" className="hover:text-[#c4a862] transition-colors inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            @thisishan1_
          </a>
          <span>·</span>
          <a href="https://github.com/H1an1" className="hover:text-[#c4a862] transition-colors">GitHub</a>
          <span>·</span>
          <a href="https://www.npmjs.com/package/antenna-fyi" className="hover:text-[#c4a862] transition-colors">npm</a>
          <span>·</span>
          <a href="/privacy" className="hover:text-[#c4a862] transition-colors">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
