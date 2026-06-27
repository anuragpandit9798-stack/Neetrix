import React, { useState } from 'react';
import { DailyLog } from '../types';
import { Calendar, Download, Upload, Trash2, TrendingUp, Info, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';

interface HistoryDashboardProps {
  logs: DailyLog[];
  onDeleteLog: (id: string) => void;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function HistoryDashboard({
  logs,
  onDeleteLog,
  onExportBackup,
  onImportBackup,
}: HistoryDashboardProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Sort logs by date descending for lists
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  // Sort logs by date ascending for charts
  const chronologicalLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);

  // Helper to format Date cleanly
  const formatDateReadable = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Generate simple SVG line/bar chart data
  const renderSVGChart = () => {
    if (chronologicalLogs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-850 rounded-xl">
          <Info className="w-5 h-5 text-slate-600 mb-1" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">No study trends available</span>
          <p className="text-[9px] text-slate-600 uppercase font-mono mt-0.5">Submit daily checklists to generate insights.</p>
        </div>
      );
    }

    const height = 150;
    const width = 500;
    const padding = 35;

    // Find max study hours and MCQs
    const maxHours = Math.max(...chronologicalLogs.map((l) => l.studyHours), 4);
    const maxMcqs = Math.max(
      ...chronologicalLogs.map((l) => l.dailyPractice.bioMcqs + l.dailyPractice.physicsMcqs + l.dailyPractice.chemistryMcqs),
      30
    );

    const pointsHours: string[] = [];
    const pointsMcqs: string[] = [];

    const numPoints = chronologicalLogs.length;
    const stepX = (width - padding * 2) / (numPoints > 1 ? numPoints - 1 : 1);

    chronologicalLogs.forEach((log, index) => {
      const x = padding + index * stepX;
      
      // Study hours coordinate
      const hRatio = log.studyHours / maxHours;
      const yH = height - padding - hRatio * (height - padding * 2);
      pointsHours.push(`${x},${yH}`);

      // MCQ coordinate
      const totalMcqs = log.dailyPractice.bioMcqs + log.dailyPractice.physicsMcqs + log.dailyPractice.chemistryMcqs;
      const mRatio = totalMcqs / maxMcqs;
      const yM = height - padding - mRatio * (height - padding * 2);
      pointsMcqs.push(`${x},${yM}`);
    });

    const dHours = pointsHours.length > 0 ? `M ${pointsHours.join(' L ')}` : '';
    const dMcqs = pointsMcqs.length > 0 ? `M ${pointsMcqs.join(' L ')}` : '';

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2 h-2 bg-cyan-400 rounded-sm inline-block" /> Study Hours
            </span>
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="w-2 h-2 bg-orange-400 rounded-sm inline-block" /> MCQs Solved
            </span>
          </div>
          <span className="text-slate-500 font-mono">Last {chronologicalLogs.length} Days</span>
        </div>

        {/* The SVG Container */}
        <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Horizontal Grid lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />

            {/* Left Axis Labels (Hours) */}
            <text x={padding - 8} y={padding + 4} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">{maxHours.toFixed(0)}h</text>
            <text x={padding - 8} y={height / 2 + 3} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">{(maxHours / 2).toFixed(0)}h</text>
            <text x={padding - 8} y={height - padding + 3} textAnchor="end" className="fill-slate-500 font-mono text-[9px]">0</text>

            {/* Right Axis Labels (MCQs) */}
            <text x={width - padding + 8} y={padding + 4} textAnchor="start" className="fill-slate-500 font-mono text-[9px]">{maxMcqs}</text>
            <text x={width - padding + 8} y={height / 2 + 3} textAnchor="start" className="fill-slate-500 font-mono text-[9px]">{(maxMcqs / 2).toFixed(0)}</text>
            <text x={width - padding + 8} y={height - padding + 3} textAnchor="start" className="fill-slate-500 font-mono text-[9px]">0</text>

            {/* Chart Lines */}
            {dHours && (
              <path
                d={dHours}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500"
              />
            )}
            {dMcqs && (
              <path
                d={dMcqs}
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500"
              />
            )}

            {/* Data point indicators */}
            {chronologicalLogs.map((log, index) => {
              const x = padding + index * stepX;
              const hRatio = log.studyHours / maxHours;
              const yH = height - padding - hRatio * (height - padding * 2);

              const totalMcqs = log.dailyPractice.bioMcqs + log.dailyPractice.physicsMcqs + log.dailyPractice.chemistryMcqs;
              const mRatio = totalMcqs / maxMcqs;
              const yM = height - padding - mRatio * (height - padding * 2);

              const dateLabel = new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

              return (
                <g key={log.id} className="group cursor-pointer">
                  {/* Vertical bar highlight on hover */}
                  <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="#334155" strokeWidth="1" className="opacity-0 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Hours Dot */}
                  <circle cx={x} cy={yH} r="4" className="fill-cyan-400 stroke-slate-950 stroke-2" />
                  
                  {/* MCQs Dot */}
                  <circle cx={x} cy={yM} r="4" className="fill-orange-400 stroke-slate-950 stroke-2" />

                  {/* X Axis Labels */}
                  <text x={x} y={height - padding + 15} textAnchor="middle" className="fill-slate-500 font-mono text-[8px] font-bold uppercase">
                    {dateLabel}
                  </text>

                  {/* Hover tooltip values */}
                  <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <rect x={x - 30} y={yH - 22} width="60" height="15" rx="3" className="fill-slate-900 stroke-slate-700 stroke" />
                    <text x={x} y={yH - 12} textAnchor="middle" className="fill-white font-mono font-bold text-[9px]">{log.studyHours.toFixed(1)} hrs</text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Grid Heatmap of study activity (last 30 days)
  const renderHeatmap = () => {
    // Generate dates for the last 28 days
    const days: Date[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    const logMap = new Map<string, DailyLog>();
    logs.forEach((log) => {
      // Standardize date keys
      const dateKey = new Date(log.date).toDateString();
      logMap.set(dateKey, log);
    });

    return (
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
          🗓 Consistency Calendar (Last 4 Weeks)
        </span>
        <div className="flex flex-col items-center bg-slate-950 p-4 rounded-xl border border-slate-850">
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday titles */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, i) => (
              <div key={i} className="text-[9px] font-bold text-slate-600 text-center w-6 uppercase">
                {wd}
              </div>
            ))}

            {/* Empty placeholders to align first day correct weekday if desired, 
                but for simplicity we just print 28 contiguous tiles */}
            {days.map((day, index) => {
              const dateStr = day.toDateString();
              const log = logMap.get(dateStr);
              
              // Color intensity based on study hours
              let bgClass = 'bg-slate-900 border-slate-850 hover:border-slate-750';
              let title = `${day.toLocaleDateString()}: No log submitted`;

              if (log) {
                const totalQ = log.dailyPractice.bioMcqs + log.dailyPractice.physicsMcqs + log.dailyPractice.chemistryMcqs;
                title = `${formatDateReadable(log.date)}\n⏱ Study: ${log.studyHours.toFixed(1)} hrs\n🧠 MCQs: ${totalQ}\n📈 Completion: ${log.improvementScore}%`;
                
                if (log.studyHours < 2) {
                  bgClass = 'bg-cyan-950/20 border-cyan-900/40 text-cyan-500 hover:border-cyan-700';
                } else if (log.studyHours < 5) {
                  bgClass = 'bg-cyan-950/40 border-cyan-800 text-cyan-400 hover:border-cyan-600';
                } else if (log.studyHours < 8) {
                  bgClass = 'bg-cyan-900/40 border-cyan-500 text-cyan-200 hover:border-cyan-400';
                } else {
                  bgClass = 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold hover:border-white';
                }
              }

              return (
                <div
                  key={index}
                  title={title}
                  className={`w-6 h-6 rounded border flex items-center justify-center text-[8px] font-mono font-bold cursor-pointer transition-all ${bgClass}`}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center w-full mt-3 px-1 text-[9px] text-slate-500 font-bold uppercase tracking-tight">
            <span>Less Active</span>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-slate-900 border border-slate-850 rounded-sm" />
              <span className="w-2 h-2 bg-cyan-950/20 border border-cyan-900/40 rounded-sm" />
              <span className="w-2 h-2 bg-cyan-900/40 border border-cyan-500 rounded-sm" />
              <span className="w-2 h-2 bg-cyan-500 border border-cyan-400 rounded-sm" />
            </div>
            <span>High Focus (8h+)</span>
          </div>
        </div>
      </div>
    );
  };

  const toggleExpandLog = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Visual Trends */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" /> Study Insights & Trends
          </h2>
          {renderSVGChart()}
        </div>

        {/* Saved Submissions List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <FileSpreadsheet className="w-4 h-4" /> Historical logs ({sortedLogs.length})
          </h3>

          {sortedLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-850 rounded-xl font-bold uppercase tracking-wider">
              No logs found. Complete checklists & save your day first!
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {sortedLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const totalMcqs = log.dailyPractice.bioMcqs + log.dailyPractice.physicsMcqs + log.dailyPractice.chemistryMcqs;

                return (
                  <div
                    key={log.id}
                    className="border border-slate-850 bg-slate-950 rounded-xl overflow-hidden hover:border-slate-800 transition-colors"
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpandLog(log.id)}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-900"
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white uppercase font-mono tracking-tight">
                          {formatDateReadable(log.date)}
                        </span>
                        <div className="flex gap-2 mt-1 text-[9px] font-bold uppercase tracking-wider font-mono">
                          <span className="text-cyan-400">⏱ {log.studyHours.toFixed(1)}h</span>
                          <span className="text-slate-700">•</span>
                          <span className="text-orange-400">🧠 {totalMcqs} MCQs</span>
                          <span className="text-slate-700">•</span>
                          <span className="text-indigo-400">📈 {log.improvementScore}% Score</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1.5 rounded text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Delete historical log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleExpandLog(log.id)}
                          className="p-1 rounded text-slate-400 hover:bg-slate-850 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-950 border-t border-slate-850 text-xs space-y-3 animate-slideDown">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Morning Self Study */}
                          <div className="space-y-1">
                            <span className="font-bold text-[9px] text-amber-500 uppercase tracking-widest block">🌅 Morning Self Study</span>
                            <ul className="space-y-1 text-slate-400 text-[10px] uppercase font-bold tracking-tight">
                              <li className="flex items-center gap-1.5">
                                {log.morningStudy.wakeUpOnTime ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>} Wake up on time
                              </li>
                              <li className="flex items-center gap-1.5">
                                {log.morningStudy.bioNcertDone ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>} Bio NCERT done {log.morningStudy.bioQuestions > 0 && `(${log.morningStudy.bioQuestions} Qs)`}
                              </li>
                              <li className="flex items-center gap-1.5">
                                {log.morningStudy.physicsDone ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>} Physics done {log.morningStudy.physicsNumericals > 0 && `(${log.morningStudy.physicsNumericals} Qs)`}
                              </li>
                              <li className="flex flex-wrap gap-1 mt-1 text-[8px]">
                                <span className={`px-1 rounded border font-mono ${log.morningStudy.chemistryOrganic ? 'bg-cyan-950/20 text-cyan-400 border-cyan-900/30' : 'bg-slate-900 text-slate-600 border-slate-850'}`}>Organic</span>
                                <span className={`px-1 rounded border font-mono ${log.morningStudy.chemistryPhysical ? 'bg-cyan-950/20 text-cyan-400 border-cyan-900/30' : 'bg-slate-900 text-slate-600 border-slate-850'}`}>Physical</span>
                                <span className={`px-1 rounded border font-mono ${log.morningStudy.chemistryInorganic ? 'bg-cyan-950/20 text-cyan-400 border-cyan-900/30' : 'bg-slate-900 text-slate-600 border-slate-850'}`}>Inorganic</span>
                              </li>
                            </ul>
                          </div>

                          {/* Routine & Class */}
                          <div className="space-y-1">
                            <span className="font-bold text-[9px] text-cyan-500 uppercase tracking-widest block">🏫 Classroom & discipline</span>
                            <ul className="space-y-1 text-slate-400 text-[10px] uppercase font-bold tracking-tight">
                              <li className="flex items-center gap-1.5">
                                {log.classActivity.attended ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>} Class properly attended
                              </li>
                              <li className="flex items-center gap-1.5">
                                {log.classActivity.notesMade ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>} Notes compiled
                              </li>
                              <li className="flex items-center gap-1.5">
                                {log.discipline.sleepHrs ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>} 7-8 hrs deep sleep
                              </li>
                              <li className="flex items-center gap-1.5">
                                {log.discipline.noSocialMedia ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>} Zero social media distraction
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-850 pt-2.5">
                          {/* Subject MCQs */}
                          <div className="space-y-1">
                            <span className="font-bold text-[9px] text-orange-500 uppercase tracking-widest block">🧠 MCQ Targets solved</span>
                            <div className="grid grid-cols-3 gap-1.5 text-center mt-1">
                              <div className="bg-slate-900 p-1.5 rounded border border-slate-850">
                                <span className="text-[8px] text-slate-500 uppercase block font-bold">Bio</span>
                                <span className="font-bold text-white font-mono text-xs">{log.dailyPractice.bioMcqs}</span>
                              </div>
                              <div className="bg-slate-900 p-1.5 rounded border border-slate-850">
                                <span className="text-[8px] text-slate-500 uppercase block font-bold">Phys</span>
                                <span className="font-bold text-white font-mono text-xs">{log.dailyPractice.physicsMcqs}</span>
                              </div>
                              <div className="bg-slate-900 p-1.5 rounded border border-slate-850">
                                <span className="text-[8px] text-slate-500 uppercase block font-bold">Chem</span>
                                <span className="font-bold text-white font-mono text-xs">{log.dailyPractice.chemistryMcqs}</span>
                              </div>
                            </div>
                          </div>

                          {/* Night routine */}
                          <div className="space-y-1">
                            <span className="font-bold text-[9px] text-indigo-400 uppercase tracking-widest block">🌙 Night Review & Prep</span>
                            <ul className="space-y-1 text-slate-400 text-[10px] uppercase font-bold tracking-tight">
                              <li className="flex items-center gap-1.5">
                                {log.nightRevision.classRevision ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>} Class lecture revision
                              </li>
                              <li className="flex items-center gap-1.5">
                                {log.nightRevision.errorUpdated ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>} Mistakes updated in log
                              </li>
                              <li className="flex items-center gap-1.5">
                                {log.nightRevision.lightMcqs ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>} Pre-sleep MCQ review
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Consistency Heatmap & Backup */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4" /> Consistency Metrics
          </h2>
          {renderHeatmap()}
        </div>

        {/* Data Sync & Backups */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2 mb-2">
            💾 Backup & Data Controls
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-normal mb-4">
            Your metrics are stored locally in this browser session. Export weekly backups to protect your tracker progress from cache resets.
          </p>

          <div className="space-y-2.5">
            {/* Export */}
            <button
              onClick={onExportBackup}
              disabled={logs.length === 0}
              className="w-full py-2 bg-slate-950 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-850 text-[10px] font-bold uppercase tracking-widest text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export Data Backup (JSON)
            </button>

            {/* Import */}
            <label className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-[10px] font-bold uppercase tracking-widest text-white rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-center">
              <Upload className="w-3.5 h-3.5 inline-block" /> Import Data Backup (JSON)
              <input
                type="file"
                accept=".json"
                onChange={onImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
