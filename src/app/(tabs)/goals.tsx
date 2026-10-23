// src/app/(tabs)/goals.tsx
import { EmptyPage, NotebookScreen, PageHeader } from "@/shared/ui";

export default function GoalsScreen() {
  return (
    <NotebookScreen>
      <PageHeader title="My Goals" subtitle="Track your long-term milestones" />
      <EmptyPage message="Goals feature coming soon!" />
    </NotebookScreen>
  );
}
