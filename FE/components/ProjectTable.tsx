import React, { useState, useEffect, useMemo } from 'react';
import { Project, ProjectStatus, RiskLevel } from '../types';
import { AlertCircle, Clock, CheckCircle, PauseCircle, PlayCircle, Search, ChevronLeft, ChevronRight, DollarSign, Archive } from 'lucide-react';

interface ProjectTableProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

const ITEMS_PER_PAGE = 20;

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayProjects = filteredProjects.slice(startIndex, endIndex);

  // Calculate totals for filtered results
  const totals = useMemo(() => {
    return filteredProjects.reduce((acc, curr) => ({
      signed: acc.signed + curr.valueSigned,
      revenue: acc.revenue + curr.revenueRecognized,
      remaining: acc.remaining + (curr.valueSigned - curr.revenueRecognized)
    }), { signed: 0, revenue: 0, remaining: 0 });
  }, [filteredProjects]);

  // Format Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Helper for pagination range
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let styles = "bg-slate-100 text-slate-800";
    let icon = <Clock className="w-3 h-3 mr-1" />;

    switch (status) {
        case ProjectStatus.COMPLETED:
            styles = "bg-emerald-100 text-emerald-800";
            icon = <CheckCircle className="w-3 h-3 mr-1" />;
            break;
        case ProjectStatus.IN_PROGRESS:
            styles = "bg-blue-100 text-blue-800";
            icon = <PlayCircle className="w-3 h-3 mr-1" />;
            break;
        case ProjectStatus.LATE:
            styles = "bg-red-100 text-red-800";
            icon = <AlertCircle className="w-3 h-3 mr-1" />;
            break;
        case ProjectStatus.ON_HOLD:
            styles = "bg-amber-100 text-amber-800";
            icon = <PauseCircle className="w-3 h-3 mr-1" />;
            break;
        case ProjectStatus.WAITING_ACCEPTANCE:
            styles = "bg-violet-100 text-violet-800";
            icon = <CheckCircle className="w-3 h-3 mr-1" />;
            break;
        case ProjectStatus.WAITING_LIQUIDATION:
            styles = "bg-gray-100 text-gray-800";
            icon = <Archive className="w-3 h-3 mr-1" />;
            break;
        case ProjectStatus.WAITING_PAYMENT:
            styles = "bg-pink-100 text-pink-800";
            icon = <DollarSign className="w-3 h-3 mr-1" />;
            break;
        default:
            styles = "bg-slate-100 text-slate-800";
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${styles}`}>
        {icon}
        {status}
      </span>
    );
  };

  const RiskBadge = ({ level }: { level: RiskLevel }) => {
    const styles = {
      [RiskLevel.HIGH]: "bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-100",
      [RiskLevel.MEDIUM]: "bg-orange-50 text-orange-700 border border-orange-200",
      [RiskLevel.LOW]: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
    return (
      <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold w-16 ${styles[level]}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Danh sách dự án</h3>
          <p className="text-sm text-slate-500">
            Hiển thị {filteredProjects.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredProjects.length)} trên tổng {filteredProjects.length} kết quả
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm dự án hoặc khách hàng..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên dự án</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Khách hàng</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Thời gian</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nhân sự</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Rủi ro</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Giá trị HĐ</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Doanh thu</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Còn lại</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {displayProjects.length > 0 ? (
              displayProjects.map((project) => (
                <tr 
                  key={project.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => onSelectProject(project)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="ml-0 max-w-[200px]">
                        <div className="text-sm font-medium text-indigo-600 group-hover:text-indigo-800 truncate" title={project.name}>{project.name}</div>
                        <div className="text-xs text-slate-500">ID: {project.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 truncate max-w-[150px]" title={project.client}>{project.client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-slate-900">Hạn: {formatDate(project.deadline)}</div>
                    {project.daysLate > 0 && <div className="text-xs text-red-500 font-medium">+{project.daysLate} ngày trễ</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-slate-500">Sales: <span className="text-slate-700">{project.salesRep.split(' ').pop()}</span></div>
                    <div className="text-xs text-slate-500">Triển khai: <span className="text-slate-700">{project.implRep.split(' ').pop()}</span></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <RiskBadge level={project.riskLevel} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600 font-mono">
                    {formatCurrency(project.valueSigned)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-emerald-600 font-mono">
                    {formatCurrency(project.revenueRecognized)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500 font-mono">
                    {formatCurrency(project.valueSigned - project.revenueRecognized)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                  Không tìm thấy dự án nào phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
          {filteredProjects.length > 0 && (
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr>
                <td colSpan={6} className="px-6 py-4 text-right text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Tổng cộng ({filteredProjects.length} dự án)
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold font-mono text-slate-900 whitespace-nowrap">
                  {formatCurrency(totals.signed)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold font-mono text-emerald-700 whitespace-nowrap">
                  {formatCurrency(totals.revenue)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold font-mono text-slate-700 whitespace-nowrap">
                  {formatCurrency(totals.remaining)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      
      {/* Pagination Footer */}
      {filteredProjects.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="text-sm text-slate-500 text-center sm:text-left">
            Hiển thị <span className="font-bold text-slate-900">{startIndex + 1}</span> - <span className="font-bold text-slate-900">{Math.min(endIndex, filteredProjects.length)}</span> trên <span className="font-bold text-slate-900">{filteredProjects.length}</span> dự án
          </div>
          
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
               disabled={currentPage === 1}
               className="w-9 h-9 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-white hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors"
             >
               <ChevronLeft className="w-4 h-4" />
             </button>
             
             {/* Desktop Pagination */}
             <div className="hidden sm:flex gap-1">
                {getPageNumbers().map((page, idx) => (
                   typeof page === 'number' ? (
                     <button
                        key={idx}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                     >
                        {page}
                     </button>
                   ) : (
                     <span key={idx} className="w-9 h-9 flex items-center justify-center text-slate-400">...</span>
                   )
                ))}
             </div>

             {/* Mobile Pagination Text */}
             <div className="flex sm:hidden items-center px-4 font-medium text-sm text-slate-600">
                Trang {currentPage} / {totalPages}
             </div>

             <button 
               onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
               disabled={currentPage === totalPages}
               className="w-9 h-9 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-white hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors"
             >
               <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTable;