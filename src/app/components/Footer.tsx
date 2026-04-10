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
          <span>H1an1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <a href="#" className="hover:text-[#c4a862] transition-colors">GitHub</a>
          <span>·</span>
          <a href="#" className="hover:text-[#c4a862] transition-colors">Discord</a>
          <span>·</span>
          <a href="#" className="hover:text-[#c4a862] transition-colors">WeChat</a>
          <span>·</span>
          <a href="#" className="hover:text-[#c4a862] transition-colors">Privacy</a>
          <span>·</span>
          <a href="#" className="hover:text-[#c4a862] transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
