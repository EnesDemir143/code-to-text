import { Github } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-slate-950 py-12">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
                <div className="text-sm text-slate-500">
                    © {new Date().getFullYear()} CodeContext.
                </div>

                <div className="flex gap-6">
                    <Link href="https://github.com/EnesDemir143/code-to-text" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors">
                        <Github className="h-5 w-5" />
                        <span>View on GitHub</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
