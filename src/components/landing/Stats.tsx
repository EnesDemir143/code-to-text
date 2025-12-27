import { ShieldCheck, Zap, ServerOff } from 'lucide-react';

export function StatsBanner() {
    return (
        <section className="border-y border-white/5 bg-slate-900/50">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 md:grid-cols-3">
                <div className="flex items-center justify-center gap-3 text-slate-300">
                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                    <span className="font-medium">100% Client-Side Privacy</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-slate-300">
                    <ServerOff className="h-5 w-5 text-indigo-400" />
                    <span className="font-medium">0 Server Uploads</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-slate-300">
                    <Zap className="h-5 w-5 text-indigo-400" />
                    <span className="font-medium">Instant Conversion</span>
                </div>
            </div>
        </section>
    );
}
