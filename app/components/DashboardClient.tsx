'use client';

import { useState, useMemo } from 'react';
import { Report } from '../types';
import { getReportById } from '../actions';

interface DashboardClientProps {
    initialReport: Report | null;
    initialId: string;
    availableReports: { id: string; date: string; label: string }[];
}

export default function DashboardClient({ initialReport, initialId, availableReports }: DashboardClientProps) {
    const [report, setReport] = useState<Report | null>(initialReport);
    const [selectedId, setSelectedId] = useState<string>(initialId);
    const [loading, setLoading] = useState(false);

    // Get current report details for display
    const currentReportMeta = useMemo(() =>
        availableReports.find(r => r.id === selectedId),
        [selectedId, availableReports]
    );

    const handleReportChange = async (id: string) => {
        setLoading(true);
        setSelectedId(id);
        try {
            const newReport = await getReportById(id);
            setReport(newReport);
        } catch (error) {
            console.error("Failed to fetch report:", error);
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePrev = () => {
        const currentIndex = availableReports.findIndex(r => r.id === selectedId);
        if (currentIndex < availableReports.length - 1) {
            handleReportChange(availableReports[currentIndex + 1].id);
        }
    };

    const handleNext = () => {
        const currentIndex = availableReports.findIndex(r => r.id === selectedId);
        if (currentIndex > 0) {
            handleReportChange(availableReports[currentIndex - 1].id);
        }
    };

    const currentIndex = availableReports.findIndex(r => r.id === selectedId);
    const hasPrev = currentIndex < availableReports.length - 1;
    const hasNext = currentIndex > 0;

    if (!report && !loading) {
        return (
            <div className="min-h-screen bg-[#121212] text-gray-400 flex flex-col items-center justify-center gap-4">
                <p>No report available.</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleReportChange(availableReports[0]?.id)}
                        className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white"
                    >
                        Go to Latest
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#121212] text-gray-100 font-sans selection:bg-white/20">
            <div className="max-w-2xl mx-auto px-6 py-12 md:py-20 space-y-12">

                {/* Header & Controls */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="space-y-2">
                        <h1 className="text-xl md:text-2xl font-medium tracking-tight text-white">Daily Intelligence</h1>
                        <p className="text-sm text-gray-500">
                            {currentReportMeta?.label}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <a href="/weekly" className="text-sm text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-md border border-white/5 hover:border-white/10 mr-2">
                            Weekly Coach →
                        </a>

                        <button
                            onClick={handlePrev}
                            disabled={!hasPrev || loading}
                            className="p-2 rounded-md hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-400 hover:text-white"
                            title="Previous Report"
                        >
                            ←
                        </button>

                        <select
                            value={selectedId}
                            onChange={(e) => handleReportChange(e.target.value)}
                            disabled={loading}
                            className="bg-[#1a1a1a] text-white border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white/30 cursor-pointer hover:bg-[#252525] transition-colors max-w-[200px]"
                        >
                            {availableReports.map(item => (
                                <option key={item.id} value={item.id}>{item.label}</option>
                            ))}
                        </select>

                        <button
                            onClick={handleNext}
                            disabled={!hasNext || loading}
                            className="p-2 rounded-md hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-400 hover:text-white"
                            title="Next Report"
                        >
                            →
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white/20"></div>
                    </div>
                ) : (
                    <>
                        {/* 🧠 Today Focus */}
                        <section className="space-y-4">
                            <h2 className="text-xs uppercase tracking-widest text-[#a8a8a8] font-semibold flex items-center gap-2">
                                <span className="text-purple-400">🧠</span> Today Focus
                            </h2>
                            <div className="p-4 rounded-lg bg-[#1a1a1a] border border-white/5 leading-relaxed text-gray-300 shadow-sm">
                                {report!.today_focus}
                            </div>
                        </section>

                        {/* 🔥 Must Explore */}
                        {report!.must_explore?.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-xs uppercase tracking-widest text-[#a8a8a8] font-semibold flex items-center gap-2">
                                    <span className="text-orange-400">🔥</span> Must Explore
                                </h2>
                                <ul className="space-y-3">
                                    {report!.must_explore.map((item, i) => (
                                        <li key={i} className="group p-4 rounded-lg bg-[#1a1a1a] border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <span className="text-gray-200 group-hover:text-white transition-colors font-medium">{item.name}</span>
                                                {(item.impact_score || item.significance) && (
                                                    <span className="text-xs text-orange-400/80 bg-orange-400/10 px-2 py-0.5 rounded">
                                                        {item.impact_score || item.significance}
                                                    </span>
                                                )}
                                            </div>
                                            {(item.details || item.description) && (
                                                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                                    {item.details || item.description}
                                                </p>
                                            )}
                                            {item.action && (
                                                <p className="text-xs text-gray-600 mt-2 uppercase tracking-wide">Action: {item.action}</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* 👀 Worth Watching */}
                        {report!.worth_watching?.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-xs uppercase tracking-widest text-[#a8a8a8] font-semibold flex items-center gap-2">
                                    <span className="text-blue-400">👀</span> Worth Watching
                                </h2>
                                <ul className="space-y-2">
                                    {report!.worth_watching.map((item, i) => (
                                        <li key={i} className="px-4 py-3 rounded-lg bg-[#1a1a1a]/50 border border-white/5 text-gray-400 text-sm">
                                            <div className="font-medium text-gray-300">{item.name}</div>
                                            {(item.details || item.description) && (
                                                <div className="mt-1 opacity-80">{item.details || item.description}</div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* 🚫 Ignore */}
                        {report!.ignore?.length > 0 && (
                            <section className="space-y-4 opacity-60 hover:opacity-100 transition-opacity">
                                <h2 className="text-xs uppercase tracking-widest text-[#a8a8a8] font-semibold flex items-center gap-2">
                                    <span className="text-red-400">🚫</span> Ignore
                                </h2>
                                <ul className="space-y-2">
                                    {report!.ignore.map((item, i) => (
                                        <li key={i} className="px-4 py-2 rounded text-sm text-gray-500 border-l-2 border-white/5 pl-4">
                                            <span className="font-medium text-gray-400">{item.name}</span>
                                            {item.reason && <span className="ml-2 opacity-50">- {item.reason}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </>
                )}

            </div>
        </main>
    );
}
