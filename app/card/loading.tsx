export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-900 text-yellow-300">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400 mb-4"></div>
      <p className="text-xl animate-pulse">正在为您制作新年贺卡...</p>
      <p className="text-sm opacity-70 mt-2">正在加载页面资源</p>
    </div>
  );
}
