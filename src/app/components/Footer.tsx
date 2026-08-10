export function Footer() {
  return (
    <footer
      className="w-full px-6 md:px-12 py-4"
      style={{
        backgroundColor: "rgba(26, 20, 18, 0.9)",
        borderTop: "1px solid rgba(184, 173, 158, 0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[12px] min-[1151px]:text-[11px] text-[#b8ad9e]">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span>&copy; 2026 Antenna</span>
          <span>·</span>
          <a href="mailto:hi@antenna.fyi" className="inline-flex items-center hover:text-[#c4a862] transition-colors max-[1150px]:min-h-11 max-[1150px]:py-3">hi@antenna.fyi</a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <a href="https://x.com/thisishan1_" className="hover:text-[#c4a862] transition-colors inline-flex items-center gap-1 max-[1150px]:min-h-11 max-[1150px]:py-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            @thisishan1_
          </a>
          <span>·</span>
          <a href="https://github.com/H1an1/Antenna" className="inline-flex items-center hover:text-[#c4a862] transition-colors max-[1150px]:min-h-11 max-[1150px]:py-3">GitHub</a>
          <span>·</span>
          <a href="/wechat-qr.jpg" target="_blank" className="inline-flex items-center hover:text-[#c4a862] transition-colors max-[1150px]:min-h-11 max-[1150px]:py-3">WeChat</a>
          <span>·</span>
          <a href="/privacy" className="inline-flex items-center hover:text-[#c4a862] transition-colors max-[1150px]:min-h-11 max-[1150px]:py-3">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
