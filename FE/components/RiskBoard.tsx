import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, RiskLevel, AIInsight, InsightCategory, InsightSeverity } from '../types';
import { 
  AlertTriangle, Clock, Users, FileText, MessageSquare, 
  ArrowRight, X, BarChart2, ShieldAlert, CheckSquare, Square
} from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, ReferenceLine 
} from 'recharts';
import AIInsightPanel from './AIInsightPanel';

interface RiskBoardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

// Extracted RiskCard component to fix Type Error with 'key' prop
interface RiskCardProps {
  project: Project;
  isSelected: boolean;
  compareMode: boolean;
  onClick: () => void;
}

const RiskCard: React.FC<RiskCardProps> = ({ project, isSelected, compareMode, onClick }) => {
  return (
    <div 
      className={`bg-white p-3 rounded-lg border shadow-sm mb-3 transition-all relative ${compareMode ? 'cursor-pointer hover:border-indigo-400' : 'cursor-pointer hover:shadow-md'}`}
      onClick={onClick}
    >
      {compareMode && (
        <div className="absolute top-3 right-3 text-indigo-600">
          {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-300" />}
        </div>
      )}

      <div className="flex justify-between items-start mb-2 pr-6">
        <span className="font-bold text-slate-800 text-sm line-clamp-1">{project.name}</span>
      </div>
      
      <p className="text-xs text-slate-500 mb-3">{project.client}</p>

      <div className="flex gap-2 mb-3">
        {project.daysLate > 0 && (
          <span className="flex items-center text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">
            <Clock className="w-3 h-3 mr-1" /> {project.daysLate}d
          </span>
        )}
        {(project.softwareErrors + project.complaints) > 0 && (
             <span className="flex items-center text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">
              <AlertTriangle className="w-3 h-3 mr-1" /> {project.softwareErrors + project.complaints}
            </span>
        )}
        {project.daysLate === 0 && (project.softwareErrors + project.complaints) === 0 && (
             <span className="flex items-center text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-medium">
              Ổn định
            </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
           <div className="flex items-center text-xs text-slate-500">
              <Users className="w-3 h-3 mr-1" />
              {project.implRep.split(' ').pop()}
           </div>
           <span className="text-[10px] font-mono text-slate-400">{project.id}</span>
      </div>
    </div>
  );
};

const RiskBoard: React.FC<RiskBoardProps> = ({ projects, onSelectProject }) => {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // --- DATA PREPARATION ---

  // Filter lists
  const highRiskProjects = projects.filter(p => p.riskLevel === RiskLevel.HIGH);
  const mediumRiskProjects = projects.filter(p => p.riskLevel === RiskLevel.MEDIUM);
  const lowRiskProjects = projects.filter(p => p.riskLevel === RiskLevel.LOW);

  // Matrix Data: X=Days Late, Y=Issues (Errors + Complaints), Z=Value
  const matrixData = projects.map(p => ({
    ...p,
    x: p.daysLate,
    y: p.softwareErrors + p.complaints,
    z: p.valueSigned, // Bubble size
    fill: p.riskLevel === RiskLevel.HIGH ? '#ef4444' : p.riskLevel === RiskLevel.MEDIUM ? '#f97316' : '#10b981'
  }));

  // Top Priority Insights (Generated for the panel)
  const priorityInsights: AIInsight[] = [...highRiskProjects]
    .sort((a, b) => (b.daysLate + b.softwareErrors) - (a.daysLate + a.softwareErrors))
    .slice(0, 3)
    .map(p => ({
        id: `pr-${p.id}`,
        title: `Ưu tiên xử lý: ${p.name}`,
        description: `Dự án trễ ${p.daysLate} ngày và có ${p.softwareErrors} lỗi. Rủi ro mất khách hàng cao.`,
        category: InsightCategory.SCHEDULE,
        severity: InsightSeverity.HIGH,
        actionLabel: 'Xem chi tiết'
    }));
  
  // Add pattern insight
  priorityInsights.push({
    id: 'pr-pat',
    title: 'Pattern: Nguyên nhân gốc rễ',
    description: '60% dự án High Risk đều do nhân sự quá tải hoặc thiếu spec rõ ràng từ đầu.',
    category: InsightCategory.QUALITY,
    severity: InsightSeverity.MEDIUM,
  })

  // --- HANDLERS ---

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds(prev => [...prev, id]);
      } else {
        alert("Chỉ có thể so sánh tối đa 3 dự án cùng lúc.");
      }
    }
  };

  const handleCompareClick = () => {
    if (selectedIds.length < 2) {
      alert("Vui lòng chọn ít nhất 2 dự án để so sánh.");
      return;
    }
    setShowCompareModal(true);
  };

  // --- SUB-COMPONENTS ---

  const ComparisonModal = () => {
    const selectedProjects = projects.filter(p => selectedIds.includes(p.id));

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              <BarChart2 className="w-6 h-6 mr-2 text-indigo-600" />
              So sánh Dự án
            </h2>
            <button onClick={() => setShowCompareModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b-2 border-slate-100 w-1/4 sticky left-0 bg-white z-10">Tiêu chí</th>
                  {selectedProjects.map(p => (
                    <th key={p.id} className="p-4 border-b-2 border-slate-100 min-w-[200px]">
                      <div className="text-lg font-bold text-indigo-900">{p.name}</div>
                      <div className="text-sm font-normal text-slate-500">{p.client}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Risk Level */}
                <tr>
                  <td className="p-4 font-medium text-slate-600 bg-slate-50/50 sticky left-0 z-10">Mức độ rủi ro</td>
                  {selectedProjects.map(p => (
                    <td key={p.id} className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        p.riskLevel === RiskLevel.HIGH ? 'bg-red-100 text-red-700' : 
                        p.riskLevel === RiskLevel.MEDIUM ? 'bg-orange-100 text-orange-700' : 
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.riskLevel}
                      </span>
                    </td>
                  ))}
                </tr>
                {/* Timeline */}
                <tr>
                  <td className="p-4 font-medium text-slate-600 bg-slate-50/50 sticky left-0 z-10">Tiến độ (Trễ hạn)</td>
                  {selectedProjects.map(p => (
                    <td key={p.id} className="p-4">
                      <div className={`font-bold ${p.daysLate > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {p.daysLate > 0 ? `${p.daysLate} ngày` : 'Đúng hạn'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Deadline: {p.deadline}</div>
                    </td>
                  ))}
                </tr>
                {/* Quality */}
                <tr>
                  <td className="p-4 font-medium text-slate-600 bg-slate-50/50 sticky left-0 z-10">Chất lượng (Lỗi)</td>
                  {selectedProjects.map(p => (
                    <td key={p.id} className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">Lỗi PM: <b>{p.softwareErrors}</b></span>
                        <span className="text-sm">Phàn nàn: <b>{p.complaints}</b></span>
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Financial */}
                <tr>
                  <td className="p-4 font-medium text-slate-600 bg-slate-50/50 sticky left-0 z-10">Tài chính</td>
                  {selectedProjects.map(p => (
                    <td key={p.id} className="p-4">
                       <div className="text-sm">Hợp đồng: <b>${(p.valueSigned/1000).toFixed(1)}k</b></div>
                       <div className="text-sm text-slate-500">Doanh thu: ${(p.revenueRecognized/1000).toFixed(1)}k</div>
                       <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{width: `${(p.revenueRecognized/p.valueSigned)*100}%`}}></div>
                       </div>
                    </td>
                  ))}
                </tr>
                {/* People */}
                 <tr>
                  <td className="p-4 font-medium text-slate-600 bg-slate-50/50 sticky left-0 z-10">Nhân sự</td>
                  {selectedProjects.map(p => (
                    <td key={p.id} className="p-4 text-sm">
                       <div>Sales: {p.salesRep}</div>
                       <div>Impl: {p.implRep}</div>
                    </td>
                  ))}
                </tr>
                {/* Management Note */}
                 <tr>
                  <td className="p-4 font-medium text-slate-600 bg-slate-50/50 sticky left-0 z-10">Ghi chú quản lý</td>
                  {selectedProjects.map(p => (
                    <td key={p.id} className="p-4 text-xs text-slate-500 italic bg-amber-50/30">
                       "{p.managerNote}"
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end">
            <button 
              onClick={() => setShowCompareModal(false)}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      {/* SECTION 1: SUMMARY */}
      <div className="bg-white border-b border-slate-200 p-6">
         <div className="max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <ShieldAlert className="w-6 h-6 mr-2 text-indigo-600" />
                  Bảng Quản lý Rủi ro
               </h2>
               <div className="flex gap-3">
                  <button 
                    onClick={() => {
                       setCompareMode(!compareMode);
                       setSelectedIds([]);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center ${
                      compareMode 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4 mr-2" />
                    {compareMode ? 'Thoát so sánh' : 'So sánh dự án'}
                  </button>
                  {compareMode && (
                     <button 
                       onClick={handleCompareClick}
                       disabled={selectedIds.length < 2}
                       className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                     >
                       So sánh ({selectedIds.length})
                     </button>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-500 text-sm font-medium">Tổng dự án theo dõi</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{projects.length}</p>
               </div>
               <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-red-600 text-sm font-medium">High Risk (Nguy hiểm)</p>
                  <p className="text-2xl font-bold text-red-700 mt-1">{highRiskProjects.length}</p>
               </div>
               <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-orange-600 text-sm font-medium">Medium Risk (Cảnh báo)</p>
                  <p className="text-2xl font-bold text-orange-700 mt-1">{mediumRiskProjects.length}</p>
               </div>
               <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <p className="text-slate-500 text-sm font-medium">% Trễ tiến độ</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                     {((projects.filter(p => p.daysLate > 0).length / projects.length) * 100).toFixed(1)}%
                  </p>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION 2: RISK MATRIX (LEFT) */}
        <div className="lg:col-span-8 space-y-6">
           {/* Matrix Chart */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-800">Ma trận Rủi ro (Tiến độ vs. Chất lượng)</h3>
                 <div className="flex gap-4 text-xs">
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>Cao</span>
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-1"></span>TB</span>
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>Thấp</span>
                 </div>
              </div>
              <div className="h-[320px] w-full bg-slate-50 rounded-lg border border-slate-100 relative">
                 <p className="absolute -left-8 top-1/2 -rotate-90 text-xs text-slate-400 font-medium transform -translate-y-1/2">Số lượng Lỗi + Phàn nàn</p>
                 <p className="absolute bottom-2 left-1/2 text-xs text-slate-400 font-medium transform -translate-x-1/2">Số ngày trễ hạn</p>
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis type="number" dataKey="x" name="Days Late" unit="d" tick={{fontSize: 10}} />
                       <YAxis type="number" dataKey="y" name="Issues" tick={{fontSize: 10}} />
                       <ZAxis type="number" dataKey="z" range={[50, 400]} name="Value" />
                       <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                             const data = payload[0].payload;
                             return (
                                <div className="bg-white p-2 border border-slate-200 shadow-lg rounded text-xs">
                                   <p className="font-bold">{data.name}</p>
                                   <p>Trễ: {data.x} ngày</p>
                                   <p>Lỗi: {data.y}</p>
                                   <p>Giá trị: ${(data.z/1000).toFixed(1)}k</p>
                                </div>
                             );
                          }
                          return null;
                       }} />
                       <ReferenceLine x={7} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Risk Threshold', position: 'insideTopRight', fontSize: 10, fill: '#64748b' }} />
                       <Scatter name="Projects" data={matrixData} shape="circle">
                          {matrixData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 cursor-pointer" onClick={() => onSelectProject(entry as any)} />
                          ))}
                       </Scatter>
                    </ScatterChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* SECTION 3: KANBAN BOARD */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* High Risk Col */}
              <div className="bg-red-50/50 rounded-xl p-4 border border-red-100">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-red-800 flex items-center">
                       <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                       High Risk
                    </h4>
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">{highRiskProjects.length}</span>
                 </div>
                 <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                    {highRiskProjects.map(p => (
                      <RiskCard 
                        key={p.id} 
                        project={p} 
                        isSelected={selectedIds.includes(p.id)}
                        compareMode={compareMode}
                        onClick={() => compareMode ? toggleSelection(p.id) : onSelectProject(p)}
                      />
                    ))}
                 </div>
              </div>

              {/* Medium Risk Col */}
               <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-orange-800 flex items-center">
                       <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                       Medium Risk
                    </h4>
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">{mediumRiskProjects.length}</span>
                 </div>
                 <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                    {mediumRiskProjects.map(p => (
                      <RiskCard 
                        key={p.id} 
                        project={p} 
                        isSelected={selectedIds.includes(p.id)}
                        compareMode={compareMode}
                        onClick={() => compareMode ? toggleSelection(p.id) : onSelectProject(p)}
                      />
                    ))}
                 </div>
              </div>

              {/* Low Risk Col */}
               <div className="bg-slate-100/50 rounded-xl p-4 border border-slate-200">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 flex items-center">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                       Low Risk
                    </h4>
                    <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">{lowRiskProjects.length}</span>
                 </div>
                 <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                    {lowRiskProjects.map(p => (
                      <RiskCard 
                        key={p.id} 
                        project={p} 
                        isSelected={selectedIds.includes(p.id)}
                        compareMode={compareMode}
                        onClick={() => compareMode ? toggleSelection(p.id) : onSelectProject(p)}
                      />
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* INSIGHT PANEL (RIGHT) - REPLACED WITH AI COMPONENT */}
        <div className="lg:col-span-4 space-y-6">
           <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <AIInsightPanel insights={priorityInsights} title="AI Priority Suggestions" />
           </div>
        </div>

      </div>

      {showCompareModal && <ComparisonModal />}
    </div>
  );
};

export default RiskBoard;
