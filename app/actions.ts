'use server'

import { createClient } from "@supabase/supabase-js";
import { Report } from "./types";

// Initialize Supabase client with Service Role Key for server-side operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getAvailableDates() {
    const { data, error } = await supabase
        .from("daily_reports")
        .select("created_at, report_date")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching dates:", error);
        return [];
    }

    // Return unique dates (using report_date if available, else falling back to created_at)
    return data.map(item => {
        return item.report_date || new Date(item.created_at).toISOString().split('T')[0];
    });
}

export async function getReportByDate(date: string) {
    // Try to match by report_date first
    let query = supabase
        .from("daily_reports")
        .select("report")
        .eq("report_date", date)
        .limit(1)
        .single();

    let { data, error } = await query;

    // Fallback: If no report_date match, try matching by created_at (start of day to end of day)
    if (error || !data) {
        const startOfDay = new Date(date).toISOString();
        const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999)).toISOString();

        const fallbackQuery = await supabase
            .from("daily_reports")
            .select("report")
            .gte("created_at", startOfDay)
            .lte("created_at", endOfDay)
            .limit(1)
            .single();

        data = fallbackQuery.data;
        error = fallbackQuery.error;
    }

    if (error) {
        console.error(`Error fetching report for ${date}:`, error);
        return null;
    }

    return data?.report as Report;
}

export async function getLatestReport() {
    const { data, error } = await supabase
        .from("daily_reports")
        .select("report, created_at, report_date")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error("Error fetching latest report:", error);
        return null;
    }

    return {
        report: data.report as Report,
        date: data.report_date || new Date(data.created_at).toISOString().split('T')[0]
    };
}
