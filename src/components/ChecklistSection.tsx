import React, { useState } from 'react';
import { MorningStudyState, DisciplineState, DailyPracticeState, ClassState, NightRevisionState } from '../types';
import { Sun, ShieldAlert, Award, School, Moon, Check, Hash } from 'lucide-react';

interface ChecklistSectionProps {
  morningStudy: MorningStudyState;
  setMorningStudy: React.Dispatch<React.SetStateAction<MorningStudyState>>;
  discipline: DisciplineState;
  setDiscipline: React.Dispatch<React.SetStateAction<DisciplineState>>;
  dailyPractice: DailyPracticeState;
  setDailyPractice: React.Dispatch<React.SetStateAction<DailyPracticeState>>;
  classActivity: ClassState;
  setClassActivity: React.Dispatch<React.SetStateAction<ClassState>>;
  nightRevision: NightRevisionState;
  setNightRevision: React.Dispatch<React.SetStateAction<NightRevisionState>>;
}

export default function ChecklistSection({
  morningStudy,
  setMorningStudy,
  discipline,
  setDiscipline,
  dailyPractice,
  setDailyPractice,
  classActivity,
  setClassActivity,
  nightRevision,
  setNightRevision,
}: ChecklistSectionProps) {
  const [activeTab, setActiveTab] = useState<'morning' | 'discipline' | 'practice' | 'class' | 'night'>('morning');

  // Calculate section progress
  const getMorningProgress = () => {
    let checked = 0;
    const total = 6;
    if (morningStudy.wakeUpOnTime) checked++;
    if (morningStudy.bioNcertDone) checked++;
    if (morningStudy.physicsDone) checked++;
    if (morningStudy.chemistryOrganic) checked++;
    if (morningStudy.chemistryPhysical) checked++;
    if (morningStudy.chemistryInorganic) checked++;
    return Math.round((checked / total) * 100);
  };

  const getDisciplineProgress = () => {
    let checked = 0;
    if (discipline.sleepHrs) checked++;
    if (discipline.noSocialMedia) checked++;
    return Math.round((checked / 2) * 100);
  };

  const getPracticeProgress = () => {
    let activeFields = 0;
    if (dailyPractice.bioMcqs > 0) activeFields++;
    if (dailyPractice.physicsMcqs > 0) activeFields++;
    if (dailyPractice.chemistryMcqs > 0) activeFields++;
    return Math.round((activeFields / 3) * 100);
  };

  const getClassProgress = () => {
    let checked = 0;
    if (classActivity.attended) checked++;
    if (classActivity.notesMade) checked++;
    if (classActivity.doubtsMarked) checked++;
    if (classActivity.attentionMaintained) checked++;
    return Math.round((checked / 4) * 100);
  };

  const getNightProgress = () => {
    let checked = 0;
    if (nightRevision.classRevision) checked++;
    if (nightRevision.morningRevision) checked++;
    if (nightRevision.errorUpdated) checked++;
    if (nightRevision.lightMcqs) checked++;
    return Math.round((checked / 4) * 100);
  };

  const tabs = [
    { id: 'morning', label: 'Morning Study', icon: <Sun className="w-3.5 h-3.5" />, progress: getMorningProgress(), color: 'border-red-500' },
    { id: 'discipline', label: 'Discipline', icon: <ShieldAlert className="w-3.5 h-3.5" />, progress: getDisciplineProgress(), color: 'border-orange-500' },
    { id: 'practice', label: 'Daily Practice', icon: <Award className="w-3.5 h-3.5" />, progress: getPracticeProgress(), color: 'border-emerald-500' },
    { id: 'class', label: 'Class', icon: <School className="w-3.5 h-3.5" />, progress: getClassProgress(), color: 'border-cyan-500' },
    { id: 'night', label: 'Night Revision', icon: <Moon className="w-3.5 h-3.5" />, progress: getNightProgress(), color: 'border-indigo-500' },
  ] as const;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Subject Mastery & Workspaces</h2>
        <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-1 rounded font-mono">
          Status: In Progress
        </span>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-slate-850 pb-3 mb-6 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeTab === tab.id
                ? 'bg-slate-950 border-slate-800 text-cyan-400 shadow-md'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500'}>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-950 border border-slate-850 text-slate-300 font-mono">
              {tab.progress}%
            </span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[280px]">
        {activeTab === 'morning' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <h3 className="font-bold text-sm text-white">Morning Self Study Protocols</h3>
            </div>
            
            <div className="grid gap-3">
              {/* Wake up checklist */}
              <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-800 transition-colors">
                <span className="text-xs font-bold text-slate-300">Wake up on time</span>
                <input
                  type="checkbox"
                  checked={morningStudy.wakeUpOnTime}
                  onChange={(e) => setMorningStudy(prev => ({ ...prev, wakeUpOnTime: e.target.checked }))}
                  className="w-5 h-5 rounded border-2 border-slate-800 bg-slate-950 accent-cyan-500 cursor-pointer"
                />
              </label>

              {/* Bio NCERT */}
              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-300">Biology NCERT read & mastered</span>
                  <input
                    type="checkbox"
                    checked={morningStudy.bioNcertDone}
                    onChange={(e) => setMorningStudy(prev => ({ ...prev, bioNcertDone: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-slate-800 bg-slate-950 accent-cyan-500 cursor-pointer"
                  />
                </label>
                
                {morningStudy.bioNcertDone && (
                  <div className="flex items-center gap-2 pl-1 animate-slideDown">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Questions Completed:</span>
                    <input
                      type="number"
                      min="0"
                      value={morningStudy.bioQuestions || ''}
                      onChange={(e) => setMorningStudy(prev => ({ ...prev, bioQuestions: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-24 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              {/* Physics */}
              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-300">Physics self study completed</span>
                  <input
                    type="checkbox"
                    checked={morningStudy.physicsDone}
                    onChange={(e) => setMorningStudy(prev => ({ ...prev, physicsDone: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-slate-800 bg-slate-950 accent-cyan-500 cursor-pointer"
                  />
                </label>

                {morningStudy.physicsDone && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1 animate-slideDown">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Concepts Covered:</span>
                      <input
                        type="text"
                        value={morningStudy.physicsConcepts}
                        onChange={(e) => setMorningStudy(prev => ({ ...prev, physicsConcepts: e.target.value }))}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-cyan-500"
                        placeholder="e.g. Rotation mechanics, Gases"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Numericals Solved:</span>
                      <input
                        type="number"
                        min="0"
                        value={morningStudy.physicsNumericals || ''}
                        onChange={(e) => setMorningStudy(prev => ({ ...prev, physicsNumericals: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Chemistry */}
              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Chemistry Syllabus Coverage:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'chemistryOrganic', label: 'Organic', checked: morningStudy.chemistryOrganic, color: 'bg-blue-950/20 text-blue-400 border-blue-900/40' },
                    { id: 'chemistryPhysical', label: 'Physical', checked: morningStudy.chemistryPhysical, color: 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' },
                    { id: 'chemistryInorganic', label: 'Inorganic', checked: morningStudy.chemistryInorganic, color: 'bg-purple-950/20 text-purple-400 border-purple-900/40' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setMorningStudy(prev => ({ ...prev, [sub.id]: !sub.checked } as any))}
                      className={`py-2 px-3 text-[11px] rounded-lg border flex items-center justify-between font-bold transition-all ${
                        sub.checked
                          ? sub.color
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      <span>{sub.label}</span>
                      {sub.checked && <Check className="w-3.5 h-3.5 text-current" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Revision Done dropdown */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
                <span className="text-xs font-bold text-slate-300">Active Revision Block Logged?</span>
                <select
                  value={morningStudy.revisionDone}
                  onChange={(e) => setMorningStudy(prev => ({ ...prev, revisionDone: e.target.value as 'Yes' | 'No' }))}
                  className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'discipline' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
              <h3 className="font-bold text-sm text-white">Daily Discipline Metrics</h3>
            </div>

            <div className="grid gap-3">
              <label className="flex items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-800 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-200">Sleep 7-8 Hours</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Critical for neuro-consolidation</div>
                </div>
                <input
                  type="checkbox"
                  checked={discipline.sleepHrs}
                  onChange={(e) => setDiscipline(prev => ({ ...prev, sleepHrs: e.target.checked }))}
                  className="w-5 h-5 rounded border-2 border-slate-800 bg-slate-950 accent-cyan-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-800 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-200">No Social Media / Distraction</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Avoid attention residue triggers</div>
                </div>
                <input
                  type="checkbox"
                  checked={discipline.noSocialMedia}
                  onChange={(e) => setDiscipline(prev => ({ ...prev, noSocialMedia: e.target.checked }))}
                  className="w-5 h-5 rounded border-2 border-slate-800 bg-slate-950 accent-cyan-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <h3 className="font-bold text-sm text-white">Conceptual Question Practiced</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Biology */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Biology MCQs</span>
                    <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">NCERT</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Hash className="w-3.5 h-3.5 text-slate-600" />
                    <input
                      type="number"
                      min="0"
                      value={dailyPractice.bioMcqs || ''}
                      onChange={(e) => setDailyPractice(prev => ({ ...prev, bioMcqs: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-sm font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Physics */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Physics MCQs</span>
                    <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">Numerical</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Hash className="w-3.5 h-3.5 text-slate-600" />
                    <input
                      type="number"
                      min="0"
                      value={dailyPractice.physicsMcqs || ''}
                      onChange={(e) => setDailyPractice(prev => ({ ...prev, physicsMcqs: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-sm font-bold font-mono text-white focus:outline-none focus:border-red-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Chemistry */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Chemistry MCQs</span>
                    <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">Balanced</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Hash className="w-3.5 h-3.5 text-slate-600" />
                    <input
                      type="number"
                      min="0"
                      value={dailyPractice.chemistryMcqs || ''}
                      onChange={(e) => setDailyPractice(prev => ({ ...prev, chemistryMcqs: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-sm font-bold font-mono text-white focus:outline-none focus:border-yellow-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-cyan-950/20 border border-cyan-900/30 p-3 rounded-xl">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Total Practice Output:</span>
                <span className="text-xl font-bold font-mono text-white">
                  {dailyPractice.bioMcqs + dailyPractice.physicsMcqs + dailyPractice.chemistryMcqs} MCQs Completed
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'class' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>
              <h3 className="font-bold text-sm text-white">Classroom Attendance & Lecture Protocols</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'attended', title: 'Lectures Attended Properly', desc: 'No missed classes, complete attendance log' },
                { id: 'notesMade', title: 'High-Fidelity Notes Scribbled', desc: 'Shorthand formulas, NCERT callouts, memory keys' },
                { id: 'doubtsMarked', title: 'Doubts & Weak Spots Logged', desc: 'Specific question indicators to review with mentors' },
                { id: 'attentionMaintained', title: 'Sustained Cognitive Attention', desc: 'No side conversations, screen browsing, or distractions' },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-start justify-between p-4 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-800 transition-colors"
                >
                  <div className="pr-4">
                    <span className="text-xs font-bold text-slate-200">{item.title}</span>
                    <p className="text-[10px] text-slate-500 font-medium uppercase mt-1 leading-normal">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={classActivity[item.id as keyof ClassState] as boolean}
                    onChange={(e) => setClassActivity(prev => ({ ...prev, [item.id]: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-slate-800 bg-slate-950 accent-cyan-500 cursor-pointer flex-shrink-0"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'night' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
              <h3 className="font-bold text-sm text-white">Pre-Sleep Night Protocol</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'classRevision', title: 'Class Lecture Revision', desc: 'Review active recall sheets and formula binders' },
                { id: 'morningRevision', title: 'Morning Coverage Audit', desc: 'Re-audit of the self study chapters done today' },
                { id: 'errorUpdated', title: 'Mistakes Logged into Notebook', desc: 'Confirmed entry of all mock mistakes or concept traps' },
                { id: 'lightMcqs', title: 'Light Retrieval MCQ Practice', desc: '10 quick factual MCQs to solidify cognitive integration' },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-start justify-between p-4 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-800 transition-colors"
                >
                  <div className="pr-4">
                    <span className="text-xs font-bold text-slate-200">{item.title}</span>
                    <p className="text-[10px] text-slate-500 font-medium uppercase mt-1 leading-normal">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={nightRevision[item.id as keyof NightRevisionState] as boolean}
                    onChange={(e) => setNightRevision(prev => ({ ...prev, [item.id]: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-slate-800 bg-slate-950 accent-cyan-500 cursor-pointer flex-shrink-0"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
