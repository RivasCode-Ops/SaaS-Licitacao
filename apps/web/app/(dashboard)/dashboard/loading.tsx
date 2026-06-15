export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-6">
            <div className="h-8 w-8 bg-gray-200 rounded" />
            <div className="h-8 w-16 bg-gray-200 rounded mt-4" />
            <div className="h-4 w-24 bg-gray-200 rounded mt-2" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded mb-2" />
        ))}
      </div>
    </div>
  )
}
