'use client';

import React from 'react';
import { Flame } from 'lucide-react';

function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center text-white px-6">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Flame className="w-12 h-12 text-orange-300" />
          <h1 className="text-6xl font-bold">Campfire Guides</h1>
        </div>
        <p className="text-2xl text-purple-100 mb-16">Tools For Companies and Teams</p>
        
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold mb-8">Coming Soon!</h2>
          <p className="text-xl">We're building something amazing for you.</p>
        </div>
      </div>
    </div>
  );
}

export default ToolsPage;