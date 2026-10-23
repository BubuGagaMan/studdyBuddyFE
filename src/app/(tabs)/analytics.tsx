// src/app/(tabs)/analytics.tsx
import { EmptyPage, NotebookScreen, PageHeader } from "@/shared/ui";

export default function AnalyticsScreen() {
  return (
    <NotebookScreen>
      <PageHeader
        title="Analytics"
        subtitle="Insights into your habits and progress"
      />
      <EmptyPage message="Analytics dashboards coming soon!" />
    </NotebookScreen>
  );
}
