import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { HomePage } from '../features/home/HomePage';
import { DirectoryPage } from '../features/directory/DirectoryPage';
import { RankingsPage } from '../features/rankings/RankingsPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { ComparePage } from '../features/compare/ComparePage';
import { DnaPage } from '../features/dna/DnaPage';
import { MethodologyPage } from '../features/methodology/MethodologyPage';
import { LabPage } from '../features/lab/LabPage';
import { TransferabilityPage } from '../features/transferability/TransferabilityPage';
import { GemsPage } from '../features/gems/GemsPage';
import { MatchCentrePage } from '../features/matches/MatchCentrePage';
import { MatchReplayPage } from '../features/replay/MatchReplayPage';
import { SimulatorPage } from '../features/simulator/SimulatorPage';
import { GoldenHarnessPage } from '../features/simulator/GoldenHarnessPage';
import { AnomaliesPage } from '../features/anomalies/AnomaliesPage';
import { ValidationPage } from '../features/validation/ValidationPage';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const FutureFeatureNotice: React.FC<{ title: string; phase: string }> = ({ title, phase }) => (
  <Card className="p-12 text-center max-w-lg mx-auto space-y-4 border-slate-200 mt-12 shadow-card">
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-[#14213D]">
      <Clock className="w-6 h-6 text-[#E6007E]" />
    </div>
    <h2 className="text-xl font-bold text-[#14213D]">{title}</h2>
    <p className="text-xs text-slate-500 leading-relaxed">
      This module is scheduled for implementation in <strong>{phase}</strong> of ROYALS INTELLIGENCE. The underlying mathematical and simulation parameters are precomputed and ready.
    </p>
    <div className="pt-2">
      <Link to="/">
        <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
          Return to Executive Home
        </Button>
      </Link>
    </div>
  </Card>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'players',
        element: <DirectoryPage />,
      },
      {
        path: 'rankings',
        element: <RankingsPage />,
      },
      {
        path: 'rankings/batters',
        element: <RankingsPage />,
      },
      {
        path: 'rankings/bowlers',
        element: <RankingsPage />,
      },
      {
        path: 'player/:id',
        element: <ProfilePage />,
      },
      {
        path: 'players/:id',
        element: <ProfilePage />,
      },
      {
        path: 'certificate/:id',
        element: <Navigate to="/players" replace />,
      },
      {
        path: 'compare',
        element: <ComparePage />,
      },
      {
        path: 'dna',
        element: <DnaPage />,
      },
      {
        path: 'dna/:id',
        element: <DnaPage />,
      },
      {
        path: 'methodology',
        element: <MethodologyPage />,
      },
      {
        path: 'lab',
        element: <LabPage />,
      },
      {
        path: 'transferability',
        element: <TransferabilityPage />,
      },
      {
        path: 'gems',
        element: <GemsPage />,
      },
      {
        path: 'matches',
        element: <MatchCentrePage />,
      },
      {
        path: 'match/:id',
        element: <MatchReplayPage />,
      },
      {
        path: 'matches/:id',
        element: <MatchReplayPage />,
      },
      {
        path: 'simulator',
        element: <SimulatorPage />,
      },
      {
        path: 'simulator/golden',
        element: <GoldenHarnessPage />,
      },
      {
        path: 'anomalies',
        element: <AnomaliesPage />,
      },
      {
        path: 'validation',
        element: <ValidationPage />,
      },
      {
        path: '*',
        element: (
          <div className="py-20 text-center">
            <h1 className="text-2xl font-black text-[#14213D]">404 — Page Not Found</h1>
            <p className="text-xs text-slate-500 mt-1 mb-4">The requested intelligence route does not exist.</p>
            <Link to="/">
              <Button size="sm">Back to Executive Home</Button>
            </Link>
          </div>
        ),
      },
    ],
  },
]);
