'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Award, Clock, Instagram, Music } from 'lucide-react';

interface Contest {
  id: string;
  title: string;
  description: string;
  platform: 'INSTAGRAM' | 'TIKTOK';
  packageQuota: number;
  expectedSubmissions: number;
  status: string;
  round: number;
  createdAt: string;
  brand: {
    name: string;
    logoUrl?: string;
    colors: string[];
    fonts: string[];
    description?: string;
  };
  _count: {
    submissions: number;
  };
}

export default function DesignerContestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || (session.user as any)?.role !== 'DESIGNER') {
      router.push('/auth/signin');
      return;
    }

    fetchContests();
  }, [session, status, router]);

  const fetchContests = async () => {
    try {
      const response = await fetch('/api/contests');
      if (response.ok) {
        const data = await response.json();
        // Filter only active contests
        const activeContests = data.contests.filter((contest: Contest) => contest.status === 'ACTIVE');
        setContests(activeContests);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinContest = (contestId: string) => {
    router.push(`/designer/contests/${contestId}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'DESIGNER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Contests</h1>
          <p className="mt-2 text-gray-600">
            Browse and join contests to showcase your design skills
          </p>
        </div>

        {/* Contest Grid */}
        {contests.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <Award className="h-full w-full" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Active Contests</h3>
            <p className="mt-2 text-gray-500">
              Check back later for new contest opportunities!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest) => (
              <div
                key={contest.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                {/* Contest Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {contest.platform === 'INSTAGRAM' ? (
                        <Instagram className="h-5 w-5 text-pink-500" />
                      ) : (
                        <Music className="h-5 w-5 text-black" />
                      )}
                      <span className="text-sm font-medium text-gray-500 uppercase">
                        {contest.platform}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Round {contest.round}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {contest.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {contest.description}
                  </p>

                  {/* Brand Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    {contest.brand.logoUrl && (
                      <img
                        src={contest.brand.logoUrl}
                        alt={contest.brand.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contest.brand.name}</p>
                      <p className="text-xs text-gray-500">Brand Guidelines Available</p>
                    </div>
                  </div>
                </div>

                {/* Contest Stats */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contest.packageQuota}</p>
                      <p className="text-xs text-gray-500">Final Posts</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contest.expectedSubmissions}</p>
                      <p className="text-xs text-gray-500">Expected</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contest._count.submissions}</p>
                      <p className="text-xs text-gray-500">Submitted</p>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="p-6">
                  <button
                    onClick={() => handleJoinContest(contest.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Join Contest & Submit Design
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
