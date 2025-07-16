'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Share2, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import Footer from '@/components/Footer';

interface SharedData {
  type: string;
  title: string;
  results: any;
  userProfile?: any;
  createdAt: string;
}

export default function SharePage() {
  const params = useParams();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const response = await fetch(`/api/share?id=${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to load shared content');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [params.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    doc.setFontSize(20);
    doc.text(data.title || 'Personal Development Plan', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.text(`Created: ${new Date(data.createdAt).toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    if (data.type === 'purpose' && data.results) {
      doc.setFontSize(14);
      doc.text('Purpose Statement', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      const purposeLines = doc.splitTextToSize(data.results.purpose || '', 170);
      purposeLines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 7;
      });

      if (data.results.insights?.length > 0) {
        yPosition += 10;
        doc.setFontSize(14);
        doc.text('Key Insights', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(11);
        data.results.insights.forEach((insight: string, index: number) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          const insightLines = doc.splitTextToSize(`${index + 1}. ${insight}`, 170);
          insightLines.forEach((line: string) => {
            doc.text(line, 20, yPosition);
            yPosition += 7;
          });
          yPosition += 3;
        });
      }
    }

    doc.save(`${data.type || 'results'}-${params.id}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-black flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Oops!</h1>
          <p className="text-gray-300 mb-6">{error || 'This shared content could not be found or may have expired.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-iris-500/90 hover:bg-iris-500 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            GO TO HOMEPAGE
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-black">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative z-10 container mx-auto p-6 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm border border-white/10"
            >
              <Share2 className="w-4 h-4" />
              {copied ? 'COPIED!' : 'SHARE'}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm border border-white/10"
            >
              <Download className="w-4 h-4" />
              DOWNLOAD PDF
            </button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">{data.title || 'Personal Development Results'}</h1>
            <p className="text-gray-400">Created on {new Date(data.createdAt).toLocaleDateString()}</p>
          </div>

          {data.type === 'purpose' && data.results && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-3">Your Purpose Statement</h2>
                <p className="text-gray-200 text-lg leading-relaxed">{data.results.purpose}</p>
              </div>

              {data.results.insights?.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Key Insights</h2>
                  <ul className="space-y-3">
                    {data.results.insights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-iris-500/30 text-indigo-300 rounded-full flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <span className="text-gray-200">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.userProfile && (
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Profile Summary</h2>
                  <div className="grid gap-4">
                    {data.userProfile.background && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Background</h3>
                        <p className="text-gray-200">{data.userProfile.background}</p>
                      </div>
                    )}
                    {data.userProfile.strengths && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Strengths</h3>
                        <p className="text-gray-200">{data.userProfile.strengths}</p>
                      </div>
                    )}
                    {data.userProfile.values && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">Values</h3>
                        <p className="text-gray-200">{data.userProfile.values}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}