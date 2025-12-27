import Link from 'next/link';
import { Terminal, Github } from 'lucide-react';

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-indigo-500/10 bg-slate-950/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white transition hover:text-indigo-400">
                    <Terminal className="h-6 w-6 text-indigo-500" />
                    <span>CodeContext</span>
                    <span className="ml-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-300">
                        Open Source
                    </span>
                </Link>

                {/* Navigation - Hidden on mobile, visible on md+ */}
                <div className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
                    <Link href="https://github.com/EnesDemir143/code-to-text" target="_blank" className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors">
                        <Github className="h-4 w-4" />
                        GitHub
                    </Link>
                    <Link href="#" className="hover:text-indigo-400 transition-colors">
                        API
                    </Link>
                    <Link href="#" className="hover:text-indigo-400 transition-colors">
                        Pricing
                    </Link>
                    <Link href="#" className="hover:text-indigo-400 transition-colors">
                        Help
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Log In
                    </button>
                    <button className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-95">
                        Sign Up
                    </button>
                </div>
            </div>
        </nav>
    );
}
