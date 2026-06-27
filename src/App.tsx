import React, { useState, useEffect } from 'react';
import { DailyLog, ErrorEntry, TrackerStats, MorningStudyState, DisciplineState, DailyPracticeState, ClassState, NightRevisionState } from './types';
import DashboardStats from './components/DashboardStats';
import StudyTimer from './components/StudyTimer';
import ChecklistSection from './components/ChecklistSection';
import ErrorNotebook from './components/ErrorNotebook';
import HistoryDashboard from './components/HistoryDashboard';
import { Sparkles, ClipboardList, BookOpen, BarChart3, AlertCircle, RefreshCw, CheckCircle2, LogOut, Cloud, CloudOff, Info, Loader2 } from 'lucide-react';
import { client, account, databases, currentConfig, Query, ID } from './appwrite';
import LoginScreen from './components/LoginScreen';

const INITIAL_MORNING_STUDY: MorningStudyState = {
  wakeUpOnTime: false,
  bioNcertDone: false,
  bioQuestions: 0,
  physicsDone: false,
  physicsConcepts: '',
  physicsNumericals: 0,
  chemistryOrganic: false,
  chemistryPhysical: false,
  chemistryInorganic: false,
  revisionDone: 'No',
};

const INITIAL_DISCIPLINE: DisciplineState = {
  sleepHrs: false,
  noSocialMedia: false,
};

const INITIAL_DAILY_PRACTICE: DailyPracticeState = {
  bioMcqs: 0,
  physicsMcqs: 0,
  chemistryMcqs: 0,
};

const INITIAL_CLASS: ClassState = {
  attended: false,
  notesMade: false,
  doubtsMarked: false,
  attentionMaintained: false,
};

const INITIAL_NIGHT_REVISION: NightRevisionState = {
  classRevision: false,
  morningRevision: false,
  errorUpdated: false,
  lightMcqs: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'tracker' | 'errors' | 'insights'>('tracker');
  
  // Appwrite Auth and Sync state
  const [user, setUser] = useState<any | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [dbSyncStatus, setDbSyncStatus] = useState<'synced' | 'unconfigured' | 'error' | 'offline'>('offline');
  const [dbSyncError, setDbSyncError] = useState<string | null>(null);

  // Persistent lists
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  
  // Unsubmitted today state
  const [morningStudy, setMorningStudy] = useState<MorningStudyState>(INITIAL_MORNING_STUDY);
  const [discipline, setDiscipline] = useState<DisciplineState>(INITIAL_DISCIPLINE);
  const [dailyPractice, setDailyPractice] = useState<DailyPracticeState>(INITIAL_DAILY_PRACTICE);
  const [classActivity, setClassActivity] = useState<ClassState>(INITIAL_CLASS);
  const [nightRevision, setNightRevision] = useState<NightRevisionState>(INITIAL_NIGHT_REVISION);

  // Stopwatch state
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [submittedToday, setSubmittedToday] = useState(false);
  const [lastSubmittedHours, setLastSubmittedHours] = useState(0);

  // Sync / query from Appwrite databases helper
  const syncFromAppwrite = async (userId: string) => {
    if (userId === 'local_user') {
      setDbSyncStatus('offline');
      setDbSyncError(null);
      return;
    }
    try {
      setDbSyncStatus('synced');
      setDbSyncError(null);
      const response = await databases.listDocuments(
        currentConfig.databaseId,
        currentConfig.collectionId,
        [
          Query.equal('userId', userId),
          Query.orderDesc('date'),
          Query.limit(100)
        ]
      );

      const parsedLogs: DailyLog[] = response.documents.map((doc: any) => {
        const totalMcq = doc.mcq || 0;
        const bMcq = Math.floor(totalMcq / 3);
        const pMcq = Math.floor(totalMcq / 3);
        const cMcq = totalMcq - (bMcq + pMcq);

        return {
          id: doc.$id || doc.date,
          date: doc.date,
          studyHours: doc.hours || 0,
          morningStudy: {
            wakeUpOnTime: true,
            bioNcertDone: bMcq > 0,
            bioQuestions: bMcq,
            physicsDone: pMcq > 0,
            physicsConcepts: '',
            physicsNumericals: pMcq,
            chemistryOrganic: false,
            chemistryPhysical: false,
            chemistryInorganic: false,
            revisionDone: 'Yes',
          },
          discipline: {
            sleepHrs: true,
            noSocialMedia: true,
          },
          dailyPractice: {
            bioMcqs: bMcq,
            physicsMcqs: pMcq,
            chemistryMcqs: cMcq,
          },
          classActivity: {
            attended: true,
            notesMade: true,
            doubtsMarked: false,
            attentionMaintained: true,
          },
          nightRevision: {
            classRevision: true,
            morningRevision: true,
            errorUpdated: doc.mistakes && doc.mistakes !== 'None logged',
            lightMcqs: false,
          },
          improvementScore: 85,
          submittedAt: doc.$createdAt || new Date().toISOString(),
        };
      });

      if (parsedLogs.length > 0) {
        setLogs(parsedLogs);
        localStorage.setItem('neet_tracker_logs', JSON.stringify(parsedLogs));
        
        // Update today's checklist state
        const todayStr = getTodayString();
        const loggedToday = parsedLogs.find((l) => l.id === todayStr);
        if (loggedToday) {
          setSubmittedToday(true);
          setLastSubmittedHours(loggedToday.studyHours);
          setMorningStudy(loggedToday.morningStudy);
          setDiscipline(loggedToday.discipline);
          setDailyPractice(loggedToday.dailyPractice);
          setClassActivity(loggedToday.classActivity);
          setNightRevision(loggedToday.nightRevision);
        } else {
          setSubmittedToday(false);
          setLastSubmittedHours(0);
        }
      }
    } catch (err: any) {
      console.warn('Appwrite databases collection query failed (perhaps unconfigured or missing attributes). Falling back to Local Cache: ', err.message);
      setDbSyncStatus('error');
      setDbSyncError(err.message || 'Database neet_tracker or collection daily_logs unconfigured.');
    }
  };

  // Initialize and load from LocalStorage & check Appwrite session
  useEffect(() => {
    // 1. First load from local storage cache
    try {
      const savedLogs = localStorage.getItem('neet_tracker_logs');
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }

      const savedErrors = localStorage.getItem('neet_tracker_errors');
      if (savedErrors) {
        setErrors(JSON.parse(savedErrors));
      }

      // Check if logged today already
      const todayStr = getTodayString();
      if (savedLogs) {
        const parsedLogs: DailyLog[] = JSON.parse(savedLogs);
        const loggedToday = parsedLogs.find((l) => l.id === todayStr);
        if (loggedToday) {
          setSubmittedToday(true);
          setLastSubmittedHours(loggedToday.studyHours);
          
          // Populate the checklists with today's already submitted values for inspection/update
          setMorningStudy(loggedToday.morningStudy);
          setDiscipline(loggedToday.discipline);
          setDailyPractice(loggedToday.dailyPractice);
          setClassActivity(loggedToday.classActivity);
          setNightRevision(loggedToday.nightRevision);
        }
      }
    } catch (e) {
      console.error('Error loading data from local storage: ', e);
    }

    // 2. Check Appwrite Session status or Offline mode preference
    async function checkSession() {
      const isOfflineMode = localStorage.getItem('neet_tracker_offline_mode') === 'true';
      if (isOfflineMode) {
        setUser({
          $id: 'local_user',
          email: 'offline.student@neet.com',
          name: 'Offline Student'
        });
        setDbSyncStatus('offline');
        setUserLoading(false);
        return;
      }

      try {
        // Auto-ping Appwrite backend to verify setup on app open as requested
        if (typeof (client as any).ping === 'function') {
          (client as any).ping().catch((pErr: any) => console.log('Appwrite auto-ping on startup failed (expected if local/unconfigured):', pErr));
        }
        const currentUser = await account.get();
        setUser(currentUser);
        // Load cloud documents from databases
        await syncFromAppwrite(currentUser.$id);
      } catch (err) {
        console.log('No active Appwrite session or connection offline. Using local mode.');
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    }
    checkSession();
  }, []);

  // Save to LocalStorage helpers
  const saveLogs = (newLogs: DailyLog[]) => {
    setLogs(newLogs);
    localStorage.setItem('neet_tracker_logs', JSON.stringify(newLogs));
  };

  const saveErrors = (newErrors: ErrorEntry[]) => {
    setErrors(newErrors);
    localStorage.setItem('neet_tracker_errors', JSON.stringify(newErrors));
  };

  const getTodayString = () => {
    // Return standard ISO format local date YYYY-MM-DD
    const local = new Date();
    const offset = local.getTimezoneOffset();
    const adjusted = new Date(local.getTime() - offset * 60 * 1000);
    return adjusted.toISOString().split('T')[0];
  };

  // Calculations for Checklist completion
  const calculateCompletionScore = (
    ms: MorningStudyState,
    ds: DisciplineState,
    cs: ClassState,
    nr: NightRevisionState
  ) => {
    let checked = 0;
    const total = 17;

    if (ms.wakeUpOnTime) checked++;
    if (ms.bioNcertDone) checked++;
    if (ms.physicsDone) checked++;
    if (ms.chemistryOrganic) checked++;
    if (ms.chemistryPhysical) checked++;
    if (ms.chemistryInorganic) checked++;
    if (ms.revisionDone === 'Yes') checked++;

    if (ds.sleepHrs) checked++;
    if (ds.noSocialMedia) checked++;

    if (cs.attended) checked++;
    if (cs.notesMade) checked++;
    if (cs.doubtsMarked) checked++;
    if (cs.attentionMaintained) checked++;

    if (nr.classRevision) checked++;
    if (nr.morningRevision) checked++;
    if (nr.errorUpdated) checked++;
    if (nr.lightMcqs) checked++;

    return Math.round((checked / total) * 100);
  };

  // Streak calculation based on dates of submitted logs
  const calculateStreakMetrics = (allLogs: DailyLog[]) => {
    if (allLogs.length === 0) {
      return { streak: 0, bestStreak: 0, lastSubmitDate: null };
    }

    // Get unique dates sorted in descending order
    const dates = Array.from(new Set(allLogs.map((l) => l.date))).sort((a, b) => b.localeCompare(a));
    const todayStr = getTodayString();
    
    // Find yesterday date string
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentStreak = 0;
    let maxStreak = 0;

    // Check if the latest log is today or yesterday
    const hasLogTodayOrYesterday = dates[0] === todayStr || dates[0] === yesterdayStr;

    if (hasLogTodayOrYesterday) {
      currentStreak = 1;
      let checkDate = new Date(dates[0]);

      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i]);
        const diffTime = Math.abs(checkDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
          checkDate = prevDate;
        } else if (diffDays > 1) {
          break; // Streak broken
        }
      }
    }

    // Calculate Best Streak
    let tempStreak = 1;
    const sortedChronological = [...dates].reverse();
    
    for (let i = 1; i < sortedChronological.length; i++) {
      const d1 = new Date(sortedChronological[i - 1]);
      const d2 = new Date(sortedChronological[i]);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak, currentStreak);

    return {
      streak: currentStreak,
      bestStreak: maxStreak,
      lastSubmitDate: dates[0] || null,
    };
  };

  // Compile overall stats
  const getStats = (): TrackerStats => {
    const { streak, bestStreak, lastSubmitDate } = calculateStreakMetrics(logs);
    
    const totalStudyHours = logs.reduce((sum, l) => sum + l.studyHours, 0) + (accumulatedSeconds / 3600);
    
    const totalMcqsSolved = logs.reduce(
      (sum, l) => sum + l.dailyPractice.bioMcqs + l.dailyPractice.physicsMcqs + l.dailyPractice.chemistryMcqs,
      0
    ) + dailyPractice.bioMcqs + dailyPractice.physicsMcqs + dailyPractice.chemistryMcqs;

    // Calculate current improvement rate
    const currentScore = calculateCompletionScore(morningStudy, discipline, classActivity, nightRevision);
    let overallImprovement = currentScore;

    if (logs.length > 0) {
      const avgPastScore = logs.reduce((sum, l) => sum + l.improvementScore, 0) / logs.length;
      overallImprovement = Math.max(0, Math.round(currentScore - avgPastScore));
    }

    return {
      streak,
      bestStreak,
      lastSubmitDate,
      totalStudyHours,
      totalMcqsSolved,
      overallImprovement,
    };
  };

  const handleTimeLogged = (seconds: number) => {
    setAccumulatedSeconds((prev) => prev + seconds);
  };

  // Reset tracker state
  const handleResetForm = () => {
    if (confirm('Are you sure you want to reset today\'s checklist progress?')) {
      setMorningStudy(INITIAL_MORNING_STUDY);
      setDiscipline(INITIAL_DISCIPLINE);
      setDailyPractice(INITIAL_DAILY_PRACTICE);
      setClassActivity(INITIAL_CLASS);
      setNightRevision(INITIAL_NIGHT_REVISION);
      setAccumulatedSeconds(0);
    }
  };

  // FINAL SUBMIT Handler
  const handleFinalSubmit = () => {
    const todayStr = getTodayString();
    const currentScore = calculateCompletionScore(morningStudy, discipline, classActivity, nightRevision);
    
    // Add logged hours from stopwatch
    const studyHrsToday = accumulatedSeconds / 3600;

    const newLog: DailyLog = {
      id: todayStr,
      date: todayStr,
      studyHours: studyHrsToday,
      morningStudy,
      discipline,
      dailyPractice,
      classActivity,
      nightRevision,
      improvementScore: currentScore,
      submittedAt: new Date().toISOString(),
    };

    // Filter out previous submission of today if it exists to allow updates
    const updatedLogs = logs.filter((l) => l.id !== todayStr);
    const finalLogsList = [...updatedLogs, newLog];

    saveLogs(finalLogsList);
    setSubmittedToday(true);
    setLastSubmittedHours(studyHrsToday);
    setShowCelebration(true);
    setAccumulatedSeconds(0); // clear accumulated timer as it is logged

    // Save to Appwrite Database if user is logged in and not in local/offline mode
    if (user && user.$id !== 'local_user') {
      const totalMcq = dailyPractice.bioMcqs + dailyPractice.physicsMcqs + dailyPractice.chemistryMcqs;
      // Fetch mistakes logged today in the Notebook tab
      const todayMistakes = errors
        .filter((e) => e.date.startsWith(todayStr))
        .map((e) => `[${e.subject}] ${e.topic}: ${e.mistake}`)
        .join('\n') || 'None logged';

      databases.listDocuments(
        currentConfig.databaseId,
        currentConfig.collectionId,
        [
          Query.equal('userId', user.$id),
          Query.equal('date', todayStr)
        ]
      ).then((existingDocs) => {
        const payload = {
          userId: user.$id,
          date: todayStr,
          hours: studyHrsToday,
          mcq: totalMcq,
          mistakes: todayMistakes
        };

        if (existingDocs.documents.length > 0) {
          return databases.updateDocument(
            currentConfig.databaseId,
            currentConfig.collectionId,
            existingDocs.documents[0].$id,
            payload
          );
        } else {
          return databases.createDocument(
            currentConfig.databaseId,
            currentConfig.collectionId,
            ID.unique(),
            payload
          );
        }
      }).then(() => {
        console.log('✅ Successfully synced with Appwrite Database!');
        setDbSyncStatus('synced');
        setDbSyncError(null);
      }).catch((err) => {
        console.error('Appwrite Database Sync Failed:', err);
        setDbSyncStatus('error');
        setDbSyncError(err.message || 'Check database_id, collection_id and attributes on Appwrite dashboard.');
        alert('⚠️ Checklist saved locally, but Appwrite Cloud Sync failed: ' + (err.message || 'Please verify your Appwrite attributes / credentials.'));
      });
    }
  };

  // Errors notebook handlers
  const handleAddError = (newErr: Omit<ErrorEntry, 'id' | 'date'>) => {
    const err: ErrorEntry = {
      ...newErr,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    saveErrors([...errors, err]);
  };

  const handleToggleReview = (id: string) => {
    const updated = errors.map((err) => (err.id === id ? { ...err, reviewed: !err.reviewed } : err));
    saveErrors(updated);
  };

  const handleDeleteError = (id: string) => {
    if (confirm('Are you sure you want to delete this mistake log?')) {
      saveErrors(errors.filter((err) => err.id !== id));
    }
  };

  // History / logs delete handler
  const handleDeleteLog = (id: string) => {
    if (confirm('Are you sure you want to delete this submission log?')) {
      const remainingLogs = logs.filter((log) => log.id !== id);
      saveLogs(remainingLogs);
      
      // If deleted today's log, unlock the submit status
      if (id === getTodayString()) {
        setSubmittedToday(false);
        setLastSubmittedHours(0);
      }
    }
  };

  // Export Data backup (JSON)
  const handleExportBackup = () => {
    const dataStr = JSON.stringify({ logs, errors }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neet_tracker_backup_${getTodayString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import Data backup (JSON)
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported.logs) && Array.isArray(imported.errors)) {
          if (confirm(`Valid backup file found containing ${imported.logs.length} logs and ${imported.errors.length} errors. Overwrite current tracker data?`)) {
            saveLogs(imported.logs);
            saveErrors(imported.errors);
            
            // Check if today was logged in the imported backup
            const todayStr = getTodayString();
            const loggedToday = imported.logs.find((l: DailyLog) => l.id === todayStr);
            if (loggedToday) {
              setSubmittedToday(true);
              setLastSubmittedHours(loggedToday.studyHours);
              setMorningStudy(loggedToday.morningStudy);
              setDiscipline(loggedToday.discipline);
              setDailyPractice(loggedToday.dailyPractice);
              setClassActivity(loggedToday.classActivity);
              setNightRevision(loggedToday.nightRevision);
            } else {
              setSubmittedToday(false);
              setLastSubmittedHours(0);
            }
            alert('🎉 Backup data imported successfully!');
          }
        } else {
          alert('Invalid backup format. Make sure you use a file previously exported from Neetrix.');
        }
      } catch (err) {
        alert('Failed to parse the backup JSON. The file might be corrupted.');
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out? Local cache and configurations will be reset.')) {
      try {
        localStorage.removeItem('neet_tracker_offline_mode');
        // Delete session from Appwrite only if not in local offline mode
        if (user && user.$id !== 'local_user') {
          await account.deleteSession('current');
        }
      } catch (err: any) {
        console.error('Logout failed:', err);
      } finally {
        setUser(null);
        setLogs([]);
        setSubmittedToday(false);
        setLastSubmittedHours(0);
        localStorage.removeItem('neet_tracker_logs');
        localStorage.removeItem('neet_tracker_offline_mode');
      }
    }
  };

  const currentStats = getStats();
  const currentCompletion = calculateCompletionScore(morningStudy, discipline, classActivity, nightRevision);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Initializing NEET Workspace...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        onLoginSuccess={(u) => {
          setUser(u);
          syncFromAppwrite(u.$id);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 antialiased">
      {/* Decorative top ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6 relative z-10">
        
        {/* Header Block */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
                Neetrix <span className="text-[9px] bg-cyan-950/40 text-cyan-400 font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-900/30">WORKSPACE</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                Optimize daily focus, record conceptual practice, and eliminate syllabus errors.
              </p>
            </div>
          </div>

          {/* Active stats badge & Logged User Info */}
          <div className="flex flex-wrap items-center gap-4 self-start md:self-center">
            {/* Sync status indicator */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-850 text-[10px] font-bold tracking-wide">
              {dbSyncStatus === 'synced' ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 uppercase tracking-wider">Cloud Synced</span>
                </>
              ) : dbSyncStatus === 'error' ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-orange-400 uppercase tracking-wider" title={dbSyncError || 'Click for error details'}>Sync Error</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500 uppercase tracking-wider">Local Only</span>
                </>
              )}
            </div>

            {/* User display name & Logout */}
            <div className="flex items-center gap-2 bg-slate-950/50 pl-3 pr-2 py-1 rounded-xl border border-slate-850">
              <div className="text-right">
                <p className="text-[10px] text-slate-300 font-bold tracking-wide max-w-[120px] truncate" title={user.email}>
                  {user.email}
                </p>
                <p className="text-[8px] text-slate-600 uppercase font-mono tracking-wider">
                  UID: {user.$id.substring(0, 8)}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 hover:bg-red-950/30 text-slate-500 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-900/20"
                title="Log Out Student Profile"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="border-l border-slate-850 h-5 self-center hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">📈 Improvement:</span>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1 ${
                currentStats.overallImprovement > 0
                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30'
                  : 'bg-slate-950 text-slate-400 border-slate-850'
              }`}>
                <span>{currentStats.overallImprovement}%</span>
              </div>
            </div>
          </div>
        </header>

        {/* Sync Status Guidance Banner if Appwrite fails */}
        {dbSyncStatus === 'error' && (
          <div className="bg-orange-950/20 border border-orange-900/30 p-4 rounded-2xl flex items-start gap-3 text-xs text-slate-300">
            <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">⚠️ Cloud Sync Warning (Appwrite Setup Required)</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Appwrite API query failed. If you haven't set up the database yet, please log into your Appwrite Console, create a database named <strong>neet_tracker</strong> and a collection named <strong>daily_logs</strong>. Make sure you add these five attributes with exact case:
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-w-sm bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 font-mono text-[9px] text-cyan-400 my-2">
                <div>• userId (string)</div>
                <div>• date (string)</div>
                <div>• hours (float)</div>
                <div>• mcq (integer)</div>
                <div>• mistakes (string)</div>
              </div>
              <p className="text-slate-500 text-[10px]">
                Active project configuration: <code className="text-slate-400">{currentConfig.endpoint}</code> (ID: <code className="text-slate-400">{currentConfig.projectId}</code>)
              </p>
              <button
                onClick={handleLogout}
                className="mt-1 text-[10px] text-orange-400 hover:text-orange-300 uppercase font-bold tracking-wider underline block"
              >
                Log Out to Change Appwrite connection endpoints
              </button>
            </div>
          </div>
        )}

        {/* Real-time Dashboard Stats row */}
        <DashboardStats stats={currentStats} />

        {/* Tab Selection */}
        <div id="tabs-navigation" className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 max-w-md">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'tracker'
                ? 'bg-slate-950 text-cyan-400 border border-slate-850 shadow'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" /> Tracker
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'errors'
                ? 'bg-slate-950 text-cyan-400 border border-slate-850 shadow'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Notebook
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'insights'
                ? 'bg-slate-950 text-cyan-400 border border-slate-850 shadow'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Insights
          </button>
        </div>

        {/* Celebration Banner when submitted successfully */}
        {showCelebration && (
          <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/30 p-5 rounded-2xl flex items-start gap-4 animate-fadeIn">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                🔥 Checklist Saved Successfully!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Excellent work! Your {currentCompletion}% preparation completion score and focus hours have been compiled into your insights trends dashboard. Continue logging errors to fine-tune your preparation strategy.
              </p>
            </div>
            <button
              onClick={() => setShowCelebration(false)}
              className="text-slate-400 hover:text-white text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab content screens */}
        {activeTab === 'tracker' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Timer and Form Submission Block */}
            <div className="space-y-6">
              <StudyTimer
                onTimeLogged={handleTimeLogged}
                accumulatedSeconds={accumulatedSeconds}
              />

              {/* Status & Final Submit panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">
                  Submission Status
                </span>

                {submittedToday ? (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-900/30">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Today Logged
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium px-2 leading-relaxed">
                      You have already submitted a log for today. Submitting again will update your saved checklist and append today's study hours.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-950/40 text-orange-400 text-[10px] font-bold uppercase tracking-wider rounded border border-orange-900/30">
                      Pending Submit
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium px-2 leading-relaxed">
                      Log your study hours, solve subject MCQs, fill the checklist, then press Final Submit below.
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-850 my-4" />

                {/* Submit / Reset Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleFinalSubmit}
                    className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase transition-colors"
                  >
                    🚀 Final Submit For Today
                  </button>

                  <button
                    onClick={handleResetForm}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-850 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Today's Checklist
                  </button>
                </div>
              </div>
            </div>

            {/* Right/Mid Col: Tabbed Checklists (Double-column width on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              <ChecklistSection
                morningStudy={morningStudy}
                setMorningStudy={setMorningStudy}
                discipline={discipline}
                setDiscipline={setDiscipline}
                dailyPractice={dailyPractice}
                setDailyPractice={setDailyPractice}
                classActivity={classActivity}
                setClassActivity={setClassActivity}
                nightRevision={nightRevision}
                setNightRevision={setNightRevision}
              />
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <ErrorNotebook
            errors={errors}
            onAddError={handleAddError}
            onToggleReview={handleToggleReview}
            onDeleteError={handleDeleteError}
          />
        )}

        {activeTab === 'insights' && (
          <HistoryDashboard
            logs={logs}
            onDeleteLog={handleDeleteLog}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
          />
        )}

      </div>
    </div>
  );
}
