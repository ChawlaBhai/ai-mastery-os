import { getPreviousWeeklyReviews } from "../actions";
import WeeklyReviewClient from "../components/WeeklyReviewClient";

export const revalidate = 0;

export default async function WeeklyReviewPage() {
    const history = await getPreviousWeeklyReviews();

    return <WeeklyReviewClient initialHistory={history} />;
}
