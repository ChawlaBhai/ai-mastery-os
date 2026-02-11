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

export type WeeklyPlan = {
    analysis: string;
    primary_focus: string;
    roadmap: {
        day: string;
        task: string;
        tool: string;
        expected_output: string;
        measurable_outcome: string;
    }[];
    build_project: string;
    stretch_experiment: string;
    success_definition: string;
    failure_definition: string;
};

export type WeeklyReview = {
    id: string;
    input_text: string;
    output_plan: WeeklyPlan;
    created_at: string;
};
