import { getLatestReport, getAvailableDates } from "./actions";
import DashboardClient from "./components/DashboardClient";

export const revalidate = 0; // Disable caching to always get the latest report

export default async function DashboardPage() {
    const availableDates = await getAvailableDates();
    const latestData = await getLatestReport();

    if (!latestData) {
        return (
            <div className="min-h-screen bg-[#121212] text-gray-400 flex items-center justify-center">
                No reports available yet.
            </div>
        );
    }

    return (
        <DashboardClient
            initialReport={latestData.report}
            initialDate={latestData.date}
            availableDates={availableDates}
        />
    );
}
