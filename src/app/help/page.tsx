import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
    return (
        <main className="min-h-screen bg-slate-950 px-6 pt-24 pb-20">
            <div className="mx-auto max-w-5xl">
                {/* Back Link */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-indigo-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Converter
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-16 text-center">
                    <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
                        How to Use <span className="text-indigo-400">CodeContext</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-slate-400">
                        Follow these simple steps to convert your local codebase into a single text file
                        optimized for Large Language Models.
                    </p>
                </div>

                {/* Steps Container */}
                <div className="space-y-24">
                    {/* Step 1 */}
                    <div className="grid gap-12 md:grid-cols-2 md:items-center">
                        <div className="order-2 md:order-1">
                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
                                <Image
                                    src="/images/step-upload-box.png"
                                    alt="Upload steps visualization"
                                    width={600}
                                    height={400}
                                    className="w-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-xl font-bold text-indigo-400 ring-1 ring-indigo-500/20">
                                1
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-white">Upload Your Project</h2>
                            <p className="mt-4 text-lg leading-relaxed text-slate-400">
                                Start by dragging and dropping your project folder or ZIP file into the simplified upload area.
                                <br /><br />
                                <span className="text-indigo-300">Privacy First:</span> Your files are processed entirely in your web browser. No code is ever sent to a remote server.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="grid gap-12 md:grid-cols-2 md:items-center">
                        <div className="order-1">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-xl font-bold text-indigo-400 ring-1 ring-indigo-500/20">
                                2
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-white">Review & Process</h2>
                            <p className="mt-4 text-lg leading-relaxed text-slate-400">
                                The tool instantly scans your directory structure, ignoring common clutter like <code>node_modules</code> or <code>.git</code>.
                                <br /><br />
                                Watch the progress bars as we categorize files by language and prepare them for conversion.
                            </p>
                        </div>
                        <div className="order-2">
                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
                                <Image
                                    src="/images/step-1.png"
                                    alt="Processing files"
                                    width={800}
                                    height={500}
                                    className="w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="grid gap-12 md:grid-cols-2 md:items-center">
                        <div className="order-2 md:order-1">
                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
                                <Image
                                    src="/images/step-2.png"
                                    alt="Conversion progress"
                                    width={800}
                                    height={500}
                                    className="w-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-xl font-bold text-indigo-400 ring-1 ring-indigo-500/20">
                                3
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-white">Automated Formatting</h2>
                            <p className="mt-4 text-lg leading-relaxed text-slate-400">
                                We automatically determine the programming language for each file and apply appropriate formatting.
                                <br /><br />
                                This step ensures that your LLM (ChatGPT, Claude, etc.) can clearly distinguish between different files and syntax.
                            </p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="grid gap-12 md:grid-cols-2 md:items-center">
                        <div className="order-1">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-xl font-bold text-indigo-400 ring-1 ring-indigo-500/20">
                                4
                            </div>
                            <h2 className="mt-4 text-2xl font-bold text-white">Download Context File</h2>
                            <p className="mt-4 text-lg leading-relaxed text-slate-400">
                                Once processing is complete, you'll see a summary of processed files.
                                <br /><br />
                                Click <span className="font-semibold text-white">Download .txt File</span> to get your consolidated codebase, ready to be pasted into your favorite AI assistant.
                            </p>
                        </div>
                        <div className="order-2">
                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
                                <Image
                                    src="/images/step-result.png"
                                    alt="Download result"
                                    width={600}
                                    height={400}
                                    className="w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-32 text-center">
                    <h3 className="mb-6 text-2xl font-semibold text-white">Ready to convert your code?</h3>
                    <Link
                        href="/"
                        className="inline-flex rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 hover:scale-105 active:scale-95"
                    >
                        Start Converting Now
                    </Link>
                </div>
            </div>
        </main>
    );
}
