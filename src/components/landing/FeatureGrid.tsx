import { Lock, FileJson, Sparkles } from 'lucide-react';

const features = [
    {
        icon: Lock,
        title: 'Privacy First',
        description: 'Files never leave your browser. Processing happens entirely in your device RAM, ensuring your code stays private.',
    },
    {
        icon: FileJson,
        title: 'Smart Filtering',
        description: 'Automatically ignores node_modules, .git, and binary files so you only get the code implementation that matters.',
    },
    {
        icon: Sparkles,
        title: 'AI Ready',
        description: 'Formats code with clear file path headers and XML-style delimiters, optimized for ChatGPT, Claude, and Gemini context windows.',
    },
];

export function FeatureGrid() {
    return (
        <section className="bg-slate-950 px-6 py-24">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-12 md:grid-cols-3">
                    {features.map((feature, idx) => (
                        <div key={idx} className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:border-indigo-500/30 hover:bg-white/10">
                            <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-indigo-500/10 p-3 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
