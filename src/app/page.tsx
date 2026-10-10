"use client";

import dynamic from "next/dynamic";
import LoadingScreen from "@/components/LoadingScreen";

const ExperienceRoot = dynamic(
  () => import("@/components/ExperienceRoot"),
  {
    ssr: false,
    loading: () => <LoadingScreen label="Folding time and space…" />,
  }
);

export default function Page() {
  return <ExperienceRoot />;
}