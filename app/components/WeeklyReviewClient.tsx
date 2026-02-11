'use client';

import { useState } from 'react';
import { WeeklyReview, WeeklyPlan } from '../types';

interface WeeklyReviewClientProps {
    initialHistory: WeeklyReview[];
}

export default function WeeklyReviewClient({ initialHistory }: WeeklyReviewClientProps) {
    const [history, setHistory] = useState<WeeklyReview[]>(initialHistory);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Auto-load the most recent review if available
    const [currentReview, setCurrentReview] = useState<WeeklyReview | null>(initialHistory.length > 0 ? initialHistory[0] : null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setError(null);
        setCurrentReview(null);

        try {
            const response = await fetch('/api/weekly_review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate review');
            }

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            // Access the actual data from the response wrapper
            const newReview = data.data;

            setCurrentReview(newReview);
            setHistory(prev => [newReview, ...prev].slice(0, 3));
            setInput('');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySelect = (id: string) => {
        const selected = history.find(r => r.id === id);
        if (selected) {
            setCurrentReview(selected);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <main className="min-h-screen bg-[#121212] text-gray-100 font-sans selection:bg-white/20">
            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-16">

                {/* Header */}
                <header className="text-center space-y-2">
                    <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-white">Weekly AI Coach</h1>
                    <p className="text-gray-500">Accelerate your mastery through structured reflection.</p>
                </header>

                {/* Section 1: Reflection Input (Hidden if viewing a review) */}
                {!currentReview && (
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="What did you explore, build, struggle with this week?"
                            className="w-full h-48 bg-[#1a1a1a] border border-white/5 rounded-xl p-6 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors resize-none text-lg leading-relaxed shadow-inner"
                            disabled={isLoading}
                        />

                        {error && (
                            <div className="text-red-400 text-sm bg-red-400/10 p-4 rounded border border-red-400/20">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-center">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !input.trim()}
                                className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                {isLoading ? 'Generating Roadmap...' : 'Generate Roadmap'}
                            </button>
                        </div>
                    </section>
                )}

                {/* Section 2: AI Coach Output */}
                {currentReview && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">

                        {/* 🔙 Back to Input */}
                        <div className="flex justify-between items-center text-sm">
                            <button onClick={() => setCurrentReview(null)} className="text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                                ← New Reflection
                            </button>
                            <div className="text-gray-600">
                                {new Date(currentReview.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        {/* Analysis & Focus */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
                                    <span className="text-blue-400 text-lg">🔍</span> Analysis
                                </h3>
                                <p className="text-gray-300 text-base leading-relaxed p-6 bg-[#1a1a1a] rounded-2xl border border-white/5 shadow-sm">
                                    {currentReview.output_plan.analysis}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
                                    <span className="text-purple-400 text-lg">🎯</span> Primary Focus
                                </h3>
                                <div className="text-white text-xl md:text-2xl font-medium p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 rounded-2xl flex items-center justify-center h-full text-center shadow-[0_0_30px_rgba(168,85,247,0.05)] relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <span className="relative z-10">{currentReview.output_plan.primary_focus}</span>
                                </div>
                            </div>
                        </div>

                        {/* 5-Day Roadmap */}
                        <div className="space-y-6">
                            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
                                <span className="text-orange-400 text-lg">🗺️</span> 5-Day Roadmap
                            </h3>
                            <div className="grid gap-4 md:grid-cols-5">
                                {currentReview.output_plan.roadmap.map((day, i) => (
                                    <div key={i} className="flex flex-col bg-[#1a1a1a] rounded-xl border border-white/5 hover:border-white/20 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/5 overflow-hidden">
                                        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1 group-hover:text-white transition-colors">{day.day}</span>
                                            <span className="text-[10px] text-orange-400/90 bg-orange-400/10 px-2 py-1 rounded-full">{day.tool}</span>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                                            <h4 className="text-gray-200 font-medium text-sm leading-snug group-hover:text-white transition-colors">{day.task}</h4>
                                            <div className="pt-3 border-t border-white/5">
                                                <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Outcome</div>
                                                <div className="text-xs text-gray-400 leading-relaxed">{day.measurable_outcome}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Assignments */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 bg-[#1a1a1a] rounded-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="text-xs text-green-400 font-bold uppercase tracking-widest mb-3 relative z-10">🛠️ Build Project</div>
                                <div className="text-gray-200 text-lg font-light relative z-10">{currentReview.output_plan.build_project}</div>
                            </div>
                            <div className="p-6 bg-[#1a1a1a] rounded-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="text-xs text-yellow-400 font-bold uppercase tracking-widest mb-3 relative z-10">⚡ Stretch Experiment</div>
                                <div className="text-gray-200 text-lg font-light relative z-10">{currentReview.output_plan.stretch_experiment}</div>
                            </div>
                        </div>

                        {/* Success/Failure */}
                        <div className="grid md:grid-cols-2 gap-6 text-sm opacity-80 hover:opacity-100 transition-opacity">
                            <div className="p-5 rounded-xl bg-green-900/5 border border-green-500/10 text-green-200/80">
                                <span className="font-bold mr-2 text-green-400">Success:</span> {currentReview.output_plan.success_definition}
                            </div>
                            <div className="p-5 rounded-xl bg-red-900/5 border border-red-500/10 text-red-200/80">
                                <span className="font-bold mr-2 text-red-400">Failure:</span> {currentReview.output_plan.failure_definition}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Navigation & History */}
                <section className="pt-16 border-t border-white/5 space-y-8">
                    <div className="flex flex-col items-center gap-6">
                        <a href="/" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Daily Intel
                        </a>

                        {history.length > 0 && (
                            <div className="w-full max-w-md space-y-2">
                                <label className="text-xs uppercase tracking-widest text-[#a8a8a8] font-semibold text-center block">Past Weekly Reviews</label>
                                <select
                                    value={currentReview?.id || ""}
                                    onChange={(e) => handleHistorySelect(e.target.value)}
                                    className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/30 cursor-pointer hover:bg-[#252525] transition-colors appearance-none text-center"
                                >
                                    <option value="" disabled>Select a previous week...</option>
                                    {history.map((review) => (
                                        <option key={review.id} value={review.id}>
                                            {new Date(review.created_at).toLocaleDateString('en-US')} — {review.output_plan.primary_focus}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
