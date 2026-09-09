'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const FunnelChartPanel = dynamic(() => import('./FunnelChartPanel'), { ssr: false });
const DiscoveryTrendChart = dynamic(() => import('./DiscoveryTrendChart'), { ssr: false });
const SpecialisationChart = dynamic(() => import('./SpecialisationChart'), { ssr: false });
const QualificationRadial = dynamic(() => import('./QualificationRadial'), { ssr: false });

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-5">
      <div className="xl:col-span-1">
        <FunnelChartPanel />
      </div>
      <div className="xl:col-span-1">
        <DiscoveryTrendChart />
      </div>
      <div className="xl:col-span-1 grid grid-rows-2 gap-5">
        <SpecialisationChart />
        <QualificationRadial />
      </div>
    </div>
  );
}