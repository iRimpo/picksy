export function Footer() {
  return (
    <footer className="bg-white py-12 px-4 md:px-8 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="gradient-text text-2xl font-black">Picksy</span>
            <p className="text-gray-400 text-sm mt-1">
              Stop overthinking. Powered by Reddit.
            </p>
          </div>
          <div className="flex items-center gap-6 text-gray-400 text-sm">
            <a href="#" className="hover:text-gray-900 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors">
              Contact
            </a>
          </div>
        </div>
        <div className="text-center mt-8 text-gray-300 text-xs">
          &copy; 2024 Picksy &bull; Built for overthinkers everywhere
        </div>
      </div>
    </footer>
  );
}
