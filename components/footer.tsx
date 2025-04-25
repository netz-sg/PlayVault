import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-4 px-4 mt-8 border-t border-gray-800 bg-gradient-to-r from-slate-900 to-slate-800">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="text-sm text-gray-400">
          © {new Date().getFullYear()} PlayVault - Deine persönliche Spielebibliothek
        </div>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <Link 
            href="https://v0netz.de" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Entwickelt von v0netz
          </Link>
          <span className="text-gray-600">|</span>
          <Link 
            href="https://github.com/netz-sg/PlayVault" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
} 