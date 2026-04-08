export function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-[#b8ad9e]/10">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-serif text-sm text-[#b8ad9e]">
          Antenna
        </span>
        <div className="flex gap-6 font-mono text-sm text-[#b8ad9e]">
          <a
            href="https://github.com/H1an1/Antenna"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#c4a862] transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
