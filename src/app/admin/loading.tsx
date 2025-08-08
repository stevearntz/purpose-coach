import ViewportContainer from '@/components/ViewportContainer';

export default function Loading() {
  return (
    <ViewportContainer className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-iris-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    </ViewportContainer>
  );
}