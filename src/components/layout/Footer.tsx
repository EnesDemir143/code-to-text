import { Github, Twitter } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-slate-950 py-12">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
                <div className="text-sm text-slate-500">
                    © {new Date().getFullYear()} CodeContext. All rights reserved.
                </div>

                <div className="flex gap-6">
                    <Link href="#" className="text-slate-500 hover:text-white transition-colors">
                        <Github className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                    </Link>
                    <Link href="#" className="text-slate-500 hover:text-white transition-colors">
                        <Twitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
