'use server'

import { createClient } from "@supabase/supabase-js";
import { Report } from "./types";

// Initialize Supabase client with Service Role Key for server-side operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getAvailableReports() {
    const { data, error } = await supabase
        .from("daily_reports")
        .select("id, created_at, report_date")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching available reports:", error);
        return [];
    }

    return data.map(item => ({
        id: item.id,
        date: item.report_date || new Date(item.created_at).toISOString().split('T')[0],
        label: new Date(item.created_at).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        })
    }));
}

export async function getReportById(id: string) {
    const { data, error } = await supabase
        .from("daily_reports")
        .select("report")
        .eq("id", id)
        .single();

    if (error) {
        console.error(`Error fetching report for id ${id}:`, error);
        return null;
    }

    return data?.report as Report;
}

export async function getLatestReport() {
    const { data, error } = await supabase
        .from("daily_reports")
        .select("id, report, created_at, report_date")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error("Error fetching latest report:", error);
        return null;
    }

    return {
        id: data.id,
        report: data.report as Report,
        date: data.report_date || new Date(data.created_at).toISOString().split('T')[0]
    };
}
