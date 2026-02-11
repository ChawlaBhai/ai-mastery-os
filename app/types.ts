export type ReportItem = {
    name: string;
    type?: string;
    description?: string; // API sometimes returns description
    details?: string;
    reason?: string;
    action?: string;
    impact_score?: string;
    significance?: string; // API sometimes returns significance
    relevance?: string;
    category?: string; // API sometimes returns category
};

export type Report = {
    must_explore: ReportItem[];
    worth_watching: ReportItem[];
    ignore: ReportItem[];
    today_focus: string;
};
