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
    const [currentReview, setCurrentReview] = useState<WeeklyReview | null>(null);
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

    return (
        <main className="min-h-screen bg-[#121212] text-gray-100 font-sans selection:bg-white/20">
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 space-y-16">

                {/* Header */}
                <header className="space-y-2 text-center">
                    <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-white">Weekly AI Coach</h1>
                    <p className="text-gray-500">Accelerate your mastery through structured reflection.</p>
                </header>

                {/* Section 1: Reflection Input */}
                <section className="space-y-6">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="What did you explore, build, struggle with this week?"
                        className="w-full h-48 bg-[#1a1a1a] border border-white/5 rounded-lg p-4 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors resize-none"
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
                            className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {isLoading ? 'Generating Roadmap...' : 'Generate Roadmap'}
                        </button>
                    </div>
                </section>

                {/* Section 2: AI Coach Output */}
                {currentReview && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Analysis & Focus */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    <span className="text-blue-400">🔍</span> Analysis
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed p-4 bg-[#1a1a1a] rounded-lg border border-white/5">
                                    {currentReview.output_plan.analysis}
                                </p>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    <span className="text-purple-400">🎯</span> Primary Focus
                                </h3>
                                <div className="text-white text-lg font-medium p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center h-full text-center">
                                    {currentReview.output_plan.primary_focus}
                                </div>
                            </div>
                        </div>

                        {/* 5-Day Roadmap */}
                        <div className="space-y-4">
                            <h3 className="text-white font-medium flex items-center gap-2">
                                <span className="text-orange-400">🗺️</span> 5-Day Roadmap
                            </h3>
                            <div className="grid gap-3">
                                {currentReview.output_plan.roadmap.map((day, i) => (
                                    <div key={i} className="p-4 bg-[#1a1a1a] rounded-lg border border-white/5 hover:border-white/10 transition-colors group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{day.day}</span>
                                                    <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">{day.tool}</span>
                                                </div>
                                                <h4 className="text-gray-200 font-medium">{day.task}</h4>
                                            </div>
                                            <div className="md:text-right border-l-2 border-white/5 pl-4 md:border-l-0 md:pl-0">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide">Outcome</div>
                                                <div className="text-sm text-gray-400">{day.measurable_outcome}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Assignments */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-5 bg-[#1a1a1a] rounded-lg border border-white/5">
                                <div className="text-xs text-green-400 font-medium uppercase tracking-widest mb-2">🛠️ Build Project</div>
                                <div className="text-gray-200">{currentReview.output_plan.build_project}</div>
                            </div>
                            <div className="p-5 bg-[#1a1a1a] rounded-lg border border-white/5">
                                <div className="text-xs text-yellow-400 font-medium uppercase tracking-widest mb-2">⚡ Stretch Experiment</div>
                                <div className="text-gray-200">{currentReview.output_plan.stretch_experiment}</div>
                            </div>
                        </div>

                        {/* Success/Failure */}
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <div className="p-4 rounded bg-green-900/10 border border-green-900/20 text-green-200/80">
                                <span className="font-bold mr-2">Success:</span> {currentReview.output_plan.success_definition}
                            </div>
                            <div className="p-4 rounded bg-red-900/10 border border-red-900/20 text-red-200/80">
                                <span className="font-bold mr-2">Failure:</span> {currentReview.output_plan.failure_definition}
                            </div>
                        </div>
                    </div>
                )}

                {/* History */}
                {!currentReview && history.length > 0 && (
                    <section className="space-y-6 pt-12 border-t border-white/5">
                        <h3 className="text-gray-500 font-medium uppercase tracking-widest text-xs">Previous Reviews</h3>
                        <div className="space-y-4">
                            {history.map((review) => (
                                <div key={review.id} className="p-4 bg-[#1a1a1a] rounded-lg border border-white/5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setCurrentReview(review)}>
                                    <div className="flex justify-between items-center">
                                        <div className="font-medium text-gray-300">{new Date(review.created_at).toLocaleDateString()}</div>
                                        <div className="text-sm text-purple-400">{review.output_plan.primary_focus}</div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{review.input_text}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {!currentReview && history.length === 0 && (
                    <div className="text-center text-gray-600 pt-12">
                        <p>Submit your reflection to generate your first roadmap.</p>
                    </div>
                )}

            </div>
        </main>
    );
}
