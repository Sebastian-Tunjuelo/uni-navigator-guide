import type { Subject } from "./mockData";

export function getGradeSummary(subject: Subject) {
  const completed = subject.activities.filter((activity) => activity.grade !== null);
  const earned = completed.reduce((acc, activity) => acc + (activity.grade! * activity.weight) / 100, 0);
  const completedWeight = completed.reduce((acc, activity) => acc + activity.weight, 0);

  return {
    completed,
    completedWeight,
    earned,
    isPassing: subject.current >= 3.0,
    pendingWeight: 100 - completedWeight,
  };
}
