import React, { useState } from 'react';
import { ErrorEntry, SubjectType } from '../types';
import { BookOpen, Search, Filter, Plus, Trash2, CheckCircle, HelpCircle } from 'lucide-react';

interface ErrorNotebookProps {
  errors: ErrorEntry[];
  onAddError: (error: Omit<ErrorEntry, 'id' | 'date'>) => void;
  onToggleReview: (id: string) => void;
  onDeleteError: (id: string) => void;
}

export default function ErrorNotebook({
  errors,
  onAddError,
  onToggleReview,
  onDeleteError,
}: ErrorNotebookProps) {
  // Input fields
  const [subject, setSubject] = useState<SubjectType>('Physics');
  const [topic, setTopic] = useState('');
  const [mistake, setMistake] = useState('');
  const [reason, setReason] = useState('');
  const [improvementPlan, setImprovementPlan] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'All' | SubjectType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Reviewed' | 'Pending'>('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !mistake.trim() || !reason.trim()) return;

    onAddError({
      subject,
      topic: topic.trim(),
      mistake: mistake.trim(),
      reason: reason.trim(),
      improvementPlan: improvementPlan.trim(),
      reviewed: false,
      difficulty,
    });

    // Reset inputs
    setTopic('');
    setMistake('');
    setReason('');
    setImprovementPlan('');
    setDifficulty('Medium');
  };

  // Filtered errors list
  const filteredErrors = errors.filter((err) => {
    const matchesSearch =
      err.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      err.mistake.toLowerCase().includes(searchQuery.toLowerCase()) ||
      err.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      err.improvementPlan.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = subjectFilter === 'All' || err.subject === subjectFilter;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Reviewed' && err.reviewed) ||
      (statusFilter === 'Pending' && !err.reviewed);

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const getDifficultyColor = (diff: 'Easy' | 'Medium' | 'Hard') => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30';
      case 'Medium':
        return 'bg-amber-950/20 text-amber-400 border-amber-900/30';
      case 'Hard':
        return 'bg-red-950/20 text-red-400 border-red-900/30';
    }
  };

  const getSubjectColor = (sub: SubjectType) => {
    switch (sub) {
      case 'Physics':
        return 'bg-red-950/20 text-red-400 border-red-900/30';
      case 'Chemistry':
        return 'bg-yellow-950/20 text-yellow-400 border-yellow-900/30';
      case 'Biology':
        return 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30';
      case 'General':
        return 'bg-slate-950 text-slate-400 border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Log Error Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4" /> Log Exam/Practice Mistake
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as SubjectType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Topic Name */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                Chapter / Topic Name
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Optics - Spherical Mirrors, Organic - Amines"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Difficulty */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                Difficulty Level
              </label>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-1 text-[10px] rounded-lg font-bold transition-all ${
                      difficulty === diff
                        ? diff === 'Easy'
                          ? 'bg-emerald-950/40 text-emerald-400'
                          : diff === 'Medium'
                          ? 'bg-amber-950/40 text-amber-400'
                          : 'bg-red-950/40 text-red-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex items-end">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight mb-2.5">
                💡 Scientific error tracking is proven to improve NEET test scores by 20%+.
              </p>
            </div>
          </div>

          {/* The Mistake Description */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
              1. What was the exact mistake?
            </label>
            <textarea
              required
              rows={2}
              value={mistake}
              onChange={(e) => setMistake(e.target.value)}
              placeholder="e.g. Calculated focal length positive instead of negative due to sign convention error."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
              2. Why did it happen? (Root Cause)
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Rushed the sign convention for concave mirror in a hurry. Lack of attention to 'virtual vs real' term."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Plan for Improvement */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
              3. How will you avoid it next time? (Action Plan)
            </label>
            <textarea
              rows={2}
              value={improvementPlan}
              onChange={(e) => setImprovementPlan(e.target.value)}
              placeholder="e.g. Draw a quick coordinate diagram for all mirrors before applying Lens/Mirror formula. Do not calculate in mind."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase transition-colors"
          >
            Save Mistake to Error Notebook
          </button>
        </form>
      </div>

      {/* Mistakes Repository / Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              📒 Mistakes Repository ({filteredErrors.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">
              {errors.filter(e => e.reviewed).length} of {errors.length} Reviewed
            </span>
          </div>

          {/* Search and Filters row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mistakes..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Subject filter */}
            <div className="relative">
              <Filter className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-3.5" />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value as any)}
                className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="All">All Subjects</option>
                <option value="Physics">Physics Only</option>
                <option value="Chemistry">Chemistry Only</option>
                <option value="Biology">Biology Only</option>
                <option value="General">General Only</option>
              </select>
            </div>

            {/* Status filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending Review</option>
                <option value="Reviewed">Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Errors list */}
        {filteredErrors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-slate-850 rounded-xl">
            <HelpCircle className="w-6 h-6 text-slate-600 mb-2" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">No mistakes found</span>
            <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold">
              {searchQuery || subjectFilter !== 'All' || statusFilter !== 'All'
                ? 'Try clearing your filters.'
                : 'Excellent! Your error log is clean.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {filteredErrors.map((err) => (
              <div
                key={err.id}
                className={`p-4 rounded-xl border transition-all ${
                  err.reviewed
                    ? 'bg-slate-950/30 border-slate-850/60 opacity-60'
                    : 'bg-slate-950 border border-slate-850 hover:border-slate-800 shadow-md'
                }`}
              >
                {/* Header row */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${getSubjectColor(err.subject)}`}>
                      {err.subject}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${getDifficultyColor(err.difficulty)}`}>
                      {err.difficulty}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">
                      {new Date(err.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Mark Reviewed Button */}
                    <button
                      onClick={() => onToggleReview(err.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        err.reviewed
                          ? 'text-emerald-400 hover:bg-emerald-500/15'
                          : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                      }`}
                      title={err.reviewed ? 'Mark as Unreviewed' : 'Mark as Reviewed'}
                    >
                      <CheckCircle className="w-4 h-4 fill-current text-opacity-10" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteError(err.id)}
                      className="p-1 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Delete mistake log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-white font-mono uppercase">
                    <span className="text-slate-500 mr-2">Topic:</span> {err.topic}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] mt-1 bg-slate-900 p-3 rounded-xl border border-slate-850/60">
                    <div>
                      <span className="font-bold text-red-400 uppercase tracking-widest text-[9px] block mb-1">The Mistake</span>
                      <p className="text-slate-300 leading-relaxed font-medium">{err.mistake}</p>
                    </div>
                    <div>
                      <span className="font-bold text-yellow-500 uppercase tracking-widest text-[9px] block mb-1">The Reason</span>
                      <p className="text-slate-300 leading-relaxed">{err.reason}</p>
                    </div>
                    <div>
                      <span className="font-bold text-cyan-400 uppercase tracking-widest text-[9px] block mb-1">Remedy / Action Plan</span>
                      <p className="text-cyan-400/90 font-medium italic leading-relaxed">{err.improvementPlan || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
