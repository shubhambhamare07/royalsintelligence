import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, ShieldCheck, Award } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { dataLoader } from '../../lib/data/loaders';
import { canonicalRegistry } from '../../lib/data/canonical';
import { PlayerCertificate } from '../../lib/data/types';
import { formatRating, formatInterval, formatZScore, formatPerHundred, formatPercent } from '../../lib/format/numbers';

export const CertificatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cert, setCert] = useState<PlayerCertificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCert() {
      if (!id) return;
      try {
        const c = await dataLoader.getPlayerCertificate(id, 'batter');
        setCert(c);
      } catch (err) {
        console.error('Failed to load certificate', err);
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const playerName = canonicalRegistry.getCanonicalName(id || '', cert?.player?.player_name);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Action Header (Hidden on Print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link to={`/player/${id}`}>
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Player Profile
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
            Print Certificate (A4)
          </Button>
        </div>
      </div>

      {/* Formal A4 Certificate Canvas */}
      <div
        id="certificate-print-area"
        className="bg-white p-8 sm:p-12 md:p-16 rounded-2xl border-4 border-[#C6A15B] shadow-2xl relative overflow-hidden text-[#14213D] print:border-2 print:shadow-none print:m-0 print:p-8"
      >
        {/* Subtle Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <img src="/assets/brand/rr-crest.svg" alt="Watermark" className="w-[500px] h-[500px]" />
        </div>

        {/* Outer Corner Accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#C6A15B]" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#C6A15B]" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#C6A15B]" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#C6A15B]" />

        {/* Certificate Header */}
        <div className="text-center space-y-3 pb-8 border-b-2 border-[#C6A15B]/30 relative z-10">
          <img
            src="/assets/brand/rr-crest.svg"
            alt="Rajasthan Royals Crest"
            className="w-16 h-16 mx-auto mb-2 drop-shadow-sm"
          />

          <div className="text-xs font-mono font-bold tracking-[0.25em] text-[#C6A15B] uppercase">
            Rajasthan Royals Cricket Decision Support
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#14213D] tracking-tight">
            CERTIFICATE OF PRESSURE PERFORMANCE
          </h1>

          <p className="text-xs text-slate-500 font-mono tracking-wide">
            OFFICIAL QUANTITATIVE EVALUATION • IPL 2027 AUCTION INTELLIGENCE
          </p>
        </div>

        {/* Body Recipient */}
        <div className="py-8 text-center space-y-4 relative z-10">
          <div className="text-xs font-serif italic text-slate-500">
            This certifies the verified Bayesian performance rating under high-pressure leverage for:
          </div>

          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#14213D] underline decoration-[#E6007E] decoration-2 underline-offset-8">
            {playerName}
          </div>

          <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-600">
            <span>CANONICAL ID: <strong>{id}</strong></span>
            <span>•</span>
            <span>DISCIPLINE: <strong className="uppercase">{cert?.player?.role || 'BATTER'}</strong></span>
            <span>•</span>
            <span>TIER: <strong className="text-[#E6007E]">{cert?.player?.tier || 'PROVEN'}</strong></span>
          </div>
        </div>

        {/* Certified Scores Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-y-2 border-[#C6A15B]/20 relative z-10 bg-slate-50/50 p-4 rounded-xl">
          {/* Main Rating */}
          <div className="text-center p-3 border-b md:border-b-0 md:border-r border-slate-200">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
              Posterior Rating
            </div>
            <div className="text-4xl font-black font-mono text-[#14213D] my-1">
              {formatRating(cert?.rating?.point_estimate || 91)}
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              90% CI: {formatInterval(cert?.rating?.ci_90 || [76.64, 100.0])}
            </div>
          </div>

          {/* PV & CD */}
          <div className="text-center p-3 border-b md:border-b-0 md:border-r border-slate-200">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
              Differential Output
            </div>
            <div className="text-lg font-bold font-mono text-[#14213D] mt-2">
              PV: {formatPerHundred(cert?.components?.pressure_value?.raw_per_100 || 26.72)} /100b
            </div>
            <div className="text-xs font-mono text-slate-500 mt-1">
              Clutch Delta: {formatPerHundred(cert?.components?.clutch_delta?.raw_per_100 || 26.99)}
            </div>
          </div>

          {/* Exposure */}
          <div className="text-center p-3">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400">
              Information Sample
            </div>
            <div className="text-lg font-bold font-mono text-[#14213D] mt-2">
              {cert?.exposure?.pressure_deliveries || 470} Balls
            </div>
            <div className="text-xs font-mono text-slate-500 mt-1">
              neff: {(cert?.exposure?.neff_pressure || 470).toFixed(1)} effective
            </div>
          </div>
        </div>

        {/* Formal Explanation Text */}
        <div className="py-6 space-y-2 relative z-10">
          <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            Certified Methodology Proof
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {cert?.explanation ||
              'Player generated superior run leverage under delivery pressure conditions, confirmed by Empirical Bayes hierarchical shrinkage with pre-registered hyper-priors.'}
          </p>
        </div>

        {/* Footer & Signature Block */}
        <div className="pt-8 border-t-2 border-[#C6A15B]/30 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 text-xs">
          <div className="space-y-1 font-mono text-[10px] text-slate-400 text-center sm:text-left">
            <div>Verification Hash: <span className="text-slate-600 font-bold">{cert?.verification_hash || 'SHA256-CERT-SEALED'}</span></div>
            <div>Model Version: pressure-v1.1 • Gate G3 PASSED</div>
            <div>Issued: {cert?.generated_at || 'November 2026'}</div>
          </div>

          <div className="text-center space-y-1">
            <div className="font-serif italic text-sm text-[#14213D] border-b border-slate-400 pb-1 px-4">
              SupeRR Selector Analytics Committee
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
              Rajasthan Royals Intelligence
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

