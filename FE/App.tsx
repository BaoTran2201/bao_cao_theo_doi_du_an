import React, { useState, useMemo } from 'react';
import { MOCK_PROJECTS, MOCK_INSIGHTS } from './mockData';
import { FilterState, ProjectStatus, RiskLevel, Project } from './types';
import FilterBar from './components/FilterBar';
import KpiSection from './components/KpiSection';
import ChartsSection from './components/ChartsSection';
import PerformanceSection from './components/PerformanceSection';
import ProjectTable from './components/ProjectTable';
import ProjectDetail from './components/ProjectDetail';
import RiskBoard from './components/RiskBoard';
import ProjectForm from './components/ProjectForm';
import AIInsightPanel from './components/AIInsightPanel';
import AdminPanel from './components/AdminPanel';
import { Activity, Bell, LayoutDashboard, ShieldAlert, PlusCircle, Sparkles, Settings, Menu, X } from 'lucide-react';

type ViewState = 'dashboard' | 'risk_board' | 'create_project' | 'edit_project' | 'admin';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null); // For Edit Flow
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    year: '',
    month: '',
    salesRep: '',
    implRep: '',
    status: '',
    riskLevel: '',
  });

  const resetFilters = () => {
    setFilters({
      year: '',
      month: '',
      salesRep: '',
      implRep: '',
      status: '',
      riskLevel: '',
    });
  };

  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(p => {
      if (filters.year && p.signYear.toString() !== filters.year) return false;
      if (filters.month && p.signMonth.toString() !== filters.month) return false;
      if (filters.salesRep && p.salesRep !== filters.salesRep) return false;
      if (filters.implRep && p.implRep !== filters.implRep) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.riskLevel && p.riskLevel !== filters.riskLevel) return false;
      return true;
    });
  }, [filters]);

  const stats = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalValue = filteredProjects.reduce((acc, p) => acc + p.valueSigned, 0);
    const totalRevenue = filteredProjects.reduce((acc, p) => acc + p.revenueRecognized, 0);
    const remainingValue = totalValue - totalRevenue;
    
    const lateProjects = filteredProjects.filter(p => p.status === ProjectStatus.LATE || p.daysLate > 0).length;
    const errorProjects = filteredProjects.filter(p => p.softwareErrors > 0 || p.complaints > 0).length;

    return {
      totalProjects,
      totalValue,
      totalRevenue,
      remainingValue,
      latePercentage: totalProjects ? (lateProjects / totalProjects) * 100 : 0,
      errorPercentage: totalProjects ? (errorProjects / totalProjects) * 100 : 0,
    };
  }, [filteredProjects]);

  // Handle Project Selection (drill down)
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setShowAIPanel(false); // Close AI panel when navigating
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setSelectedProject(null); // Close detail view
    setCurrentView('edit_project');
  };

  const handleSaveProject = (projectData: Partial<Project>) => {
    // In a real app, this would save to backend
    console.log("Saving project:", projectData);
    alert(`Đã lưu thay đổi cho dự án: ${projectData.name} (Demo)`);
    setEditingProject(null);
    setCurrentView('dashboard');
  };

  const handleViewChange = (view: ViewState) => {
    setCurrentView(view);
    setMobileMenuOpen(false); // Close mobile menu on navigate
  };

  // If Detail View is active, it overrides everything
  if (selectedProject) {
    return (
      <ProjectDetail 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)} 
        onEdit={() => handleEditProject(selectedProject)}
      />
    );
  }

  // If Admin View is active
  if (currentView === 'admin') {
    return (
      <AdminPanel onBack={() => setCurrentView('dashboard')} />
    );
  }

  // If Create/Edit Project View is active
  if (currentView === 'create_project' || currentView === 'edit_project') {
    return (
      <ProjectForm 
        onCancel={() => {
          setEditingProject(null);
          setCurrentView('dashboard');
        }}
        onSave={handleSaveProject}
        initialData={currentView === 'edit_project' ? editingProject || undefined : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12 relative overflow-x-hidden">
      {/* Top Header */}
      <header className="bg-slate-900 text-white py-3 px-4 sm:px-6 shadow-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
             {/* Mobile Menu Button */}
             <button 
               className="md:hidden p-1 text-slate-300 hover:text-white"
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             >
               {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>

            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                 <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-none">Báo cáo theo dõi dự án</h1>
                 <h1 className="text-xs text-slate-400 font-normal hidden sm:block">Project Dashboard</h1>
              </div>
            </div>
            
            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex ml-8 space-x-1">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Tổng quan
              </button>
              <button 
                onClick={() => setCurrentView('risk_board')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'risk_board' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                Bảng đánh giá rủi ro
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             {/* AI Toggle Button */}
             <button 
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`flex items-center px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${showAIPanel ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-800 border-slate-700 text-indigo-300 hover:bg-slate-700'}`}
             >
                <Sparkles className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">AI Assistant</span>
             </button>

             {/* Create Project: Text on desktop, Icon on mobile */}
             <button 
                onClick={() => setCurrentView('create_project')}
                className="flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all transform hover:scale-105"
             >
                <PlusCircle className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Tạo dự án</span>
             </button>

             <div className="text-right hidden lg:block border-l border-slate-700 pl-4">
                <p className="text-sm font-medium">Xin chào, Quản lý</p>
                <p className="text-xs text-slate-400">Cập nhật: Hôm nay</p>
             </div>
             
             {/* Admin / Settings Entry */}
             <button 
                onClick={() => setCurrentView('admin')}
                className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
                title="Admin Settings"
             >
                <Settings className="w-5 h-5 text-slate-300" />
             </button>

             <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 border-slate-800 shrink-0">
                GD
             </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-slate-800 mt-3 animate-in slide-in-from-top-2">
            <div className="space-y-1">
               <button 
                onClick={() => handleViewChange('dashboard')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${currentView === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Tổng quan
              </button>
              <button 
                onClick={() => handleViewChange('risk_board')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${currentView === 'risk_board' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <ShieldAlert className="w-5 h-5 mr-3" />
                Bảng đánh giá rủi ro
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Container with Sidebar support */}
      <div className="flex flex-row max-w-[1600px] mx-auto">
        
        {/* Left/Center Content */}
        <div className={`flex-1 transition-all duration-300 w-full ${showAIPanel ? 'lg:pr-6' : ''}`}>
          
          {/* Sticky Filter Bar */}
          <FilterBar filters={filters} setFilters={setFilters} onReset={resetFilters} />

          {/* Main Content Area */}
          {currentView === 'dashboard' ? (
            <main className="px-4 sm:px-6 mt-6 sm:mt-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
              {/* Section 2: KPIs */}
              <section>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                   <h2 className="text-lg font-bold text-slate-800">Tổng quan tình hình</h2>
                   <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm w-fit">
                      Hiển thị {filteredProjects.length} bản ghi
                   </span>
                </div>
                <KpiSection stats={stats} />
              </section>

              {/* Section 3: Trends */}
              <ChartsSection projects={filteredProjects} />

              {/* Section 4: People Performance */}
              <PerformanceSection projects={filteredProjects} />

              {/* Section 5: Drill Down Table */}
              <ProjectTable projects={filteredProjects} onSelectProject={handleSelectProject} />
            </main>
          ) : (
            <main className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <RiskBoard projects={filteredProjects} onSelectProject={handleSelectProject} />
            </main>
          )}
        </div>

        {/* Right Sidebar - AI Panel */}
        <div 
          className={`
            fixed top-[60px] right-0 bottom-0 w-full sm:w-[350px] bg-white border-l border-slate-200 shadow-xl z-40 transform transition-transform duration-300 ease-in-out
            lg:relative lg:top-0 lg:h-auto lg:shadow-none lg:border-l-0 lg:border-l-slate-200 lg:bg-transparent lg:block
            ${showAIPanel ? 'translate-x-0' : 'translate-x-full lg:hidden'}
          `}
        >
          {showAIPanel && (
             <div className="h-[calc(100vh-60px)] lg:h-auto sticky top-20 lg:pt-8 lg:pr-6 lg:pb-8">
                <AIInsightPanel 
                  insights={MOCK_INSIGHTS} 
                  onClose={() => setShowAIPanel(false)} 
                  className="h-full rounded-none lg:rounded-xl shadow-none lg:shadow-sm border-0 lg:border"
                />
             </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default App;