import ResultsClient from "@/app/results/[id]/ResultsClient";

export default function PrintPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { tier?: string };
}) {
  const tier = searchParams?.tier === "premium" ? "premium" : "free";

  return (
    <div className="results-wrap">
      <ResultsClient id={params.id} />
    </div>
  );
}