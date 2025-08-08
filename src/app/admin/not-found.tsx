import ViewportContainer from '@/components/ViewportContainer';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <ViewportContainer className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-md mx-auto mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              The page you're looking for doesn't exist.
            </p>
            <Link
              href="/admin"
              className="inline-block px-6 py-3 bg-iris-500 text-white rounded-lg hover:bg-iris-600 transition-colors font-semibold"
            >
              Return to Admin Dashboard
            </Link>
          </div>
        </div>
      </ViewportContainer>
      <Footer />
    </>
  );
}