import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define Report Type
type Report = {
    must_explore: string[];
    worth_watching: string[];
    ignore: string[];
    today_focus: string;
};

export const revalidate = 0; // Disable caching to always get the latest report

export default async function Dashboard() {
    // Fetch latest report
    const { data, error } = await supabase
        .from("daily_reports")
        .select("report")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error("Supabase Error:", error);
        return (
            <div className="min-h-screen bg-[#121212] text-gray-400 flex items-center justify-center p-4">
                <div className="text-center space-y-2">
                    <p>Unable to load intelligence report.</p>
                    <p className="text-sm opacity-50">{error.message}</p>
                </div>
            </div>
        );
    }

    const report = data?.report as Report;

    if (!report) {
        return (
            <div className="min-h-screen bg-[#121212] text-gray-400 flex items-center justify-center">
                No reports available today.
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#121212] text-gray-100 font-sans selection:bg-white/20">
            <div className="max-w-2xl mx-auto px-6 py-12 md:py-20 space-y-12">

                {/* Header */}
                <header className="space-y-2 mb-16">
                    <h1 className="text-xl md:text-2xl font-medium tracking-tight text-white">Daily Intelligence</h1>
                    <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </header>

                {/* 🧠 Today Focus */}
                <section className="space-y-4">
                    <h2 className="text-xs uppercase tracking-widest text-[#a8a8a8] font-semibold flex items-center gap-2">
                        <span className="text-purple-400">🧠</span> Today Focus
                    </h2>
                    <div className="p-4 rounded-lg bg-[#1a1a1a] border border-white/5 leading-relaxed text-gray-300 shadow-sm">
                        {report.today_focus}
                    </div>
                </section>

                {/* 🔥 Must Explore */}
                {report.must_explore?.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-xs uppercase tracking-widest text-[#a8a8a8] font-semibold flex items-center gap-2">
                            <span className="text-orange-400">🔥</span> Must Explore
                        </h2>
                        <ul className="space-y-3">
                            {report.must_explore.map((item, i) => (
                                <li key={i} className="group p-4 rounded-lg bg-[#1a1a1a] border border-white/5 hover:border-white/10 transition-colors">
                                    <span className="text-gray-200 group-hover:text-white transition-colors">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* 👀 Worth Watching */}
                {report.worth_watching?.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-xs uppercase tracking-widest text-[#a8a8a8] font-semibold flex items-center gap-2">
                            <span className="text-blue-400">👀</span> Worth Watching
                        </h2>
                        <ul className="space-y-2">
                            {report.worth_watching.map((item, i) => (
                                <li key={i} className="px-4 py-3 rounded-lg bg-[#1a1a1a]/50 border border-white/5 text-gray-400 text-sm">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* 🚫 Ignore */}
                {report.ignore?.length > 0 && (
                    <section className="space-y-4 opacity-60 hover:opacity-100 transition-opacity">
                        <h2 className="text-xs uppercase tracking-widest text-[#a8a8a8] font-semibold flex items-center gap-2">
                            <span className="text-red-400">🚫</span> Ignore
                        </h2>
                        <ul className="space-y-2">
                            {report.ignore.map((item, i) => (
                                <li key={i} className="px-4 py-2 rounded text-sm text-gray-500 border-l-2 border-white/5 pl-4">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

            </div>
        </main>
    );
}
