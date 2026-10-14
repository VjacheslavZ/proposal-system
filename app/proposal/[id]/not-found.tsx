export default function ProposalNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-stone-50 to-stone-100 px-4">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-stone-500 uppercase">Exclusive Resorts · Concierge</p>
        <h1 className="mt-6 font-serif text-4xl text-stone-900">This proposal is not available</h1>
        <p className="mt-4 text-stone-600">Please use the latest link from your concierge, or reach out to them directly.</p>
      </div>
    </div>
  );
}
