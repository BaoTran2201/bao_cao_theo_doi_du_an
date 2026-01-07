import React from 'react';
import { Project, ProjectStatus, RiskLevel, AIInsight, InsightCategory, InsightSeverity } from '../types';
import { 
  ArrowLeft, Calendar, DollarSign, Users, AlertTriangle, 
  CheckCircle, Clock, AlertOctagon, FileText, User, 
  Briefcase, Activity, ShieldAlert, MessageSquare, Edit 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AIInsightPanel from './AIInsightPanel';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onEdit?: () => void; // New Prop
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onEdit }) => {
  
  // Formatters
  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const remainingValue = project.valueSigned - project.revenueRecognized;
  const progressPercent = project.valueSigned > 0 
    ? Math.min(100, Math.round((project.revenueRecognized / project.valueSigned) * 100))
    : 0;

  // Chart Data
  const financialData = [
    { name: 'Đã ký', value: project.valueSigned, color: '#6366f1' }, // Indigo
    { name: 'Doanh thu', value: project.revenueRecognized, color: '#10b981' }, // Emerald
    { name: 'Còn lại', value: remainingValue, color: '#94a3b8' }, // Slate
  ];

  // Helper UI Components
  const StatusBadge = ({ status }: { status: string }) => {
    let styles = "bg-slate-100 text-slate-800 border-slate-200";
    switch (status) {
        case ProjectStatus.COMPLETED: styles = "bg-emerald-100 text-emerald-800 border-emerald-200"; break;
        case ProjectStatus.IN_PROGRESS: styles = "bg-blue-100 text-blue-800 border-blue-200"; break;
        case ProjectStatus.LATE: styles = "bg-red-100 text-red-800 border-red-200"; break;
        case ProjectStatus.ON_HOLD: styles = "bg-amber-100 text-amber-800 border-amber-200"; break;
        case ProjectStatus.WAITING_ACCEPTANCE: styles = "bg-violet-100 text-violet-800 border-violet-200"; break;
        case ProjectStatus.WAITING_PAYMENT: styles = "bg-pink-100 text-pink-800 border-pink-200"; break;
        case ProjectStatus.WAITING_LIQUIDATION: styles = "bg-gray-100 text-gray-800 border-gray-200"; break;
    }
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${styles}`}>{status}</span>;
  };

  const RiskBadge = ({ level }: { level: RiskLevel }) => {
     const styles = {
      [RiskLevel.HIGH]: "bg-red-600 text-white",
      [RiskLevel.MEDIUM]: "bg-orange-500 text-white",
      [RiskLevel.LOW]: "bg-emerald-500 text-white",
    };
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold shadow-sm ${styles[level]}`}>
        <ShieldAlert className="w-4 h-4" />
        {level} Risk
      </div>
    );
  };

  const KPICard = ({ label, value, subtext, icon, alert }: any) => (
    <div className={`bg-white p-4 rounded-xl border ${alert ? 'border-red-200 bg-red-50' : 'border-slate-100'} shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className={`text-xl font-bold mt-1 ${alert ? 'text-red-700' : 'text-slate-900'}`}>{value}</p>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-2 rounded-lg ${alert ? 'bg-red-100 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // --- GENERATE PROJECT SPECIFIC INSIGHTS ---
  const projectInsights: AIInsight[] = [];
  
  if (project.daysLate > 7) {
    projectInsights.push({
        id: 'pi-1',
        title: 'Nguy cơ vỡ tiến độ nghiêm trọng',
        description: `Dự án đã trễ ${project.daysLate} ngày so với cam kết. Deadline ${formatDate(project.deadline)} khó khả thi nếu không bổ sung nguồn lực.`,
        category: InsightCategory.SCHEDULE,
        severity: InsightSeverity.HIGH,
        actionLabel: 'Họp khẩn cấp'
    });
  }
  
  if (project.softwareErrors > 3) {
      projectInsights.push({
        id: 'pi-2',
        title: 'Chất lượng bàn giao thấp',
        description: 'Phát sinh nhiều lỗi phần mềm trong giai đoạn UAT, có thể ảnh hưởng đến kỳ nghiệm thu sắp tới.',
        category: InsightCategory.QUALITY,
        severity: InsightSeverity.HIGH,
    });
  }

  if (project.valueSigned > 0 && project.revenueRecognized / project.valueSigned < 0.2 && project.status === ProjectStatus.IN_PROGRESS) {
       projectInsights.push({
        id: 'pi-3',
        title: 'Doanh thu ghi nhận thấp',
        description: 'Dự án đã triển khai nhưng mới ghi nhận <20% doanh thu. Cần đẩy nhanh nghiệm thu mốc 1.',
        category: InsightCategory.FINANCIAL,
        severity: InsightSeverity.MEDIUM,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 animate-in fade-in duration-300">
      
      {/* SECTION 1: HEADER */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center mb-3">
            <button onClick={onBack} className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại Dashboard
            </button>
            {onEdit && (
              <button 
                onClick={onEdit} 
                className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Chỉnh sửa thông tin</span>
                <span className="sm:hidden">Sửa</span>
              </button>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-lg sm:text-xl border border-indigo-200 shrink-0">
                {project.name.substring(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight break-words">{project.name}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center whitespace-nowrap"><Briefcase className="w-3 h-3 mr-1" /> {project.client}</span>
                  <span className="hidden sm:inline w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="whitespace-nowrap">ID: {project.id}</span>
                  <span className="hidden sm:inline w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="whitespace-nowrap">Ký: {project.signMonth}/{project.signYear}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={project.status} />
              <RiskBadge level={project.riskLevel} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 mt-6 sm:mt-8 space-y-6">
        
        {/* SECTION 2: KPI SNAPSHOT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard 
            label="Giá trị hợp đồng" 
            value={formatCurrency(project.valueSigned)} 
            icon={<DollarSign className="w-5 h-5" />} 
          />
          <KPICard 
            label="Doanh thu ghi nhận" 
            value={formatCurrency(project.revenueRecognized)} 
            subtext={`${progressPercent}% hoàn thành`}
            icon={<Activity className="w-5 h-5" />} 
          />
          <KPICard 
            label="Số ngày trễ" 
            value={`${project.daysLate} ngày`} 
            alert={project.daysLate > 7}
            icon={<Clock className="w-5 h-5" />} 
          />
           <KPICard 
            label="Lỗi & Phàn nàn" 
            value={project.softwareErrors + project.complaints}
            alert={(project.softwareErrors + project.complaints) > 0} 
            icon={<AlertTriangle className="w-5 h-5" />} 
          />
        </div>
        
        {/* AI INSIGHT SECTION (NEW) */}
        {projectInsights.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldAlert className="w-32 h-32 text-indigo-500" />
             </div>
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                   <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center">
                      <ShieldAlert className="w-5 h-5 mr-2 text-indigo-600" />
                      AI Risk Assessment
                   </h3>
                   <p className="text-sm text-slate-600 mb-4">
                      Hệ thống phát hiện {projectInsights.length} vấn đề cần lưu ý đặc biệt đối với dự án này dựa trên dữ liệu lịch sử và tiến độ hiện tại.
                   </p>
                </div>
                <div className="lg:col-span-2">
                   <AIInsightPanel insights={projectInsights} variant="inline" className="bg-transparent" title="" />
                </div>
             </div>
          </div>
        )}

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMN 1 & 2: Main Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SECTION 3: TIMELINE & PROGRESS */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-indigo-500" /> Tiến độ & Mốc thời gian
               </h3>
               
               <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-6">
                  <div className="flex-1">
                     <p className="text-sm text-slate-500 mb-1">Ngày Kickoff</p>
                     <p className="text-lg font-bold text-slate-800 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        {formatDate(project.kickoffDate)}
                     </p>
                  </div>
                  <div className="flex-1">
                     <p className="text-sm text-slate-500 mb-1">Deadline cam kết</p>
                     <p className="text-lg font-bold text-slate-800 flex items-center">
                        <AlertOctagon className="w-4 h-4 mr-2 text-slate-400" />
                        {formatDate(project.deadline)}
                     </p>
                  </div>
                  <div className="flex-1">
                     <p className="text-sm text-slate-500 mb-1">Ngày hoàn thành (Thực tế)</p>
                     <p className={`text-lg font-bold flex items-center ${project.completionDate ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {project.completionDate ? formatDate(project.completionDate) : 'Đang thực hiện'}
                     </p>
                  </div>
               </div>

               {/* Progress Bar */}
               <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
                  <div 
                     className="bg-indigo-600 h-4 rounded-full transition-all duration-500" 
                     style={{ width: `${progressPercent}%` }}
                  ></div>
               </div>
               <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>0%</span>
                  <span>Tiến độ ghi nhận doanh thu: {progressPercent}%</span>
                  <span>100%</span>
               </div>
            </div>

            {/* SECTION 4: PERSONNEL */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-500" /> Nhân sự phụ trách
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                     <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 mr-3 shrink-0">
                        {project.salesRep.substring(0, 1)}
                     </div>
                     <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{project.salesRep}</p>
                        <p className="text-xs text-slate-500">Sales Representative</p>
                     </div>
                  </div>
                  <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                     <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-600 mr-3 shrink-0">
                        {project.implRep.substring(0, 1)}
                     </div>
                     <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{project.implRep}</p>
                        <p className="text-xs text-slate-500">Implementation Lead</p>
                     </div>
                  </div>
               </div>
             </div>

             {/* SECTION 5: MANAGEMENT NOTE */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-slate-500" /> Đánh giá của Quản lý
               </h3>
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 italic text-slate-600 mb-3">
                  "{project.managerNote}"
               </div>
               <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-slate-500 mr-2">Rating:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                     <span key={star} className={`text-lg ${star <= project.managerRating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                  ))}
               </div>
            </div>

          </div>

          {/* COLUMN 3: SIDEBAR STATS */}
          <div className="space-y-6">
             
             {/* Financial Chart */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Tài chính dự án</h3>
                <div className="h-48 text-xs">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financialData} layout="vertical" margin={{top: 0, right: 30, left: 10, bottom: 0}}>
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                         <Tooltip cursor={{fill: 'transparent'}} formatter={(val: number) => formatCurrency(val)} />
                         <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {financialData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Issues List */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                   <AlertTriangle className="w-4 h-4 mr-2 text-red-500" /> Vấn đề tồn đọng
                </h3>
                <div className="space-y-3">
                   {project.issueSoftware && (
                      <div className="flex items-start p-2 bg-red-50 text-red-800 rounded text-sm">
                         <AlertOctagon className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                         <div>
                            <span className="font-bold block">Lỗi Phần mềm</span>
                            <span className="text-xs opacity-80">{project.softwareErrors} bugs nghiêm trọng</span>
                         </div>
                      </div>
                   )}
                   {project.issueClient && (
                      <div className="flex items-start p-2 bg-orange-50 text-orange-800 rounded text-sm">
                         <MessageSquare className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                         <div>
                            <span className="font-bold block">Phàn nàn từ Khách hàng</span>
                            <span className="text-xs opacity-80">{project.complaints} phản hồi tiêu cực</span>
                         </div>
                      </div>
                   )}
                   {project.issueAttitude && (
                      <div className="flex items-start p-2 bg-yellow-50 text-yellow-800 rounded text-sm">
                         <User className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                         <div>
                            <span className="font-bold block">Thái độ / Tác phong</span>
                            <span className="text-xs opacity-80">Cần chấn chỉnh nhân sự</span>
                         </div>
                      </div>
                   )}
                   {!project.issueSoftware && !project.issueClient && !project.issueAttitude && !project.issueSpec && (
                      <div className="text-center py-4 text-slate-400 text-sm italic">
                         Không có vấn đề nghiêm trọng nào được ghi nhận.
                      </div>
                   )}
                </div>
             </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectDetail;