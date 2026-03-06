export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-gray-800 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 tracking-wide">Зареждане...</p>
      </div>
    </div>
  );
}
