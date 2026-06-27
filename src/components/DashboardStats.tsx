import React from 'react';
import { Flame, Trophy, Clock, Target, TrendingUp } from 'lucide-react';
import { TrackerStats } from '../types';

interface DashboardStatsProps {
  stats: TrackerStats;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Current Streak',
      value: `${stats.streak} Days`,
      subtitle: stats.streak > 0 ? '🔥 Keep the fire burning!' : 'Start your streak today!',
      color: 'text-orange-500',
      icon: <Flame className="w-5 h-5 text-orange-500" />,
    },
    {
      title: 'Best Streak',
      value: `${stats.bestStreak} Days`,
      subtitle: '⭐ All-time record',
      color: 'text-amber-500',
      icon: <Trophy className="w-5 h-5 text-amber-500" />,
    },
    {
      title: 'Total Study Time',
      value: `${stats.totalStudyHours.toFixed(1)} hrs`,
      subtitle: '⏱ Focus hours logged',
      color: 'text-cyan-400',
      icon: <Clock className="w-5 h-5 text-cyan-400" />,
    },
    {
      title: 'MCQs Practiced',
      value: stats.totalMcqsSolved,
      subtitle: '🧠 Questions solved',
      color: 'text-emerald-400',
      icon: <Target className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: 'Daily Improvement',
      value: `${stats.overallImprovement}%`,
      subtitle: '📈 Prep completion rate',
      color: 'text-cyan-400',
      icon: <TrendingUp className="w-5 h-5 text-cyan-400" />,
    },
  ];

  return (
    <div id="stats-grid" className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`card border bg-slate-900 border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl hover:border-slate-700 transition-all duration-300 ${
            index === 4 ? 'col-span-2 md:col-span-1' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {card.title}
            </span>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              {card.icon}
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold font-mono tracking-tight mb-1 ${card.color}`}>
              {card.value}
            </div>
            <p className="text-[10px] font-medium text-slate-400 leading-snug">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

