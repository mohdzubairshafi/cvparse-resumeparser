"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

type Stats = {
  resumesParsed: number;
  tokensPrompt: number;
  tokensCompletion: number;
  totalTokens: number;
};

async function fetchStats(): Promise<Stats> {
  const res = await fetch("/api/stats");
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Failed to load stats");
  }
  const data = await res.json();
  return data.stats;
}

export default function UsageStats() {
  const { user } = useUser();
  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useQuery<Stats>({
    queryKey: ["userStats"],
    queryFn: fetchStats,
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load stats"
      );
    }
  }, [isError, error]);

  // const {
  //   data: stats,
  //   isLoading,
  //   isError,
  // } = useQuery<Stats>({
  //   queryKey: ["userStats"],
  //   queryFn: fetchStats,
  //   enabled: !!user?.id,
  //   onError: (err: any) => {
  //     toast.error(err?.message || "Failed to load stats");
  //   },
  // });

  return (
    <section className="py-24 bg-gradient-to-r from-green-50 to-white">
      <div className=" mx-auto px-6">
        <div className="bg-white rounded-3xl  p-10">
          <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">
            Your Usage Stats
          </h2>

          {isLoading ? (
            <p className="text-center text-gray-500">Loading stats...</p>
          ) : isError || !stats ? (
            <p className="text-center text-red-500">Unable to load stats</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <StatCard
                label="Total Resumes Parsed"
                value={stats.resumesParsed}
              />
              <StatCard label="Prompt Tokens Used" value={stats.tokensPrompt} />
              <StatCard
                label="Completion Tokens Used"
                value={stats.tokensCompletion}
              />
              <StatCard label="Total Tokens Used" value={stats.totalTokens} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-emerald-100 p-6 rounded-xl shadow-md hover:shadow-lg transition">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-green-800 mt-2">{value}</p>
    </div>
  );
}
