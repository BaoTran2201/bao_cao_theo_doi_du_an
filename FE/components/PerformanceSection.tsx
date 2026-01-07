import React, { useMemo } from 'react';
import { Project } from '../types';
import { User, Briefcase, AlertTriangle } from 'lucide-react';

interface PerformanceSectionProps {
  projects: Project[];
}

const PerformanceTable: React.FC<{ title: string, data: any[], type: 'sales' | 'impl' }> = ({ title, data, type }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          {type === 'sales' ? <Briefcase className="w-4 h-4 text-indigo-500" /> : <User className="w-4 h-4 text-emerald-500" />}
          {title}
        </h3>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Bảng xếp hạng</span>
      </div>
      <div className="overflow-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Tên</th>
              <th className="px-6 py-3 text-right">Số dự án</th>
              <th className="px-6 py-3 text-right">Doanh thu</th>
              <th className="px-6 py-3 text-right">Lỗi/Phàn nàn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 font-medium text-slate-700">
                  {idx < 3 && <span className="inline-block w-4 text-center mr-1 text-xs text-amber-500">★</span>}
                  {row.name}
                </td>
                <td className="px-6 py-3 text-right text-slate-600">{row.count}</td>
                <td className="px-6 py-3 text-right text-slate-600 font-mono">
                  {formatCurrency(row.revenue)}
                </td>
                <td className="px-6 py-3 text-right">
                   <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.issues > 2 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                      {row.issues > 2 && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {row.issues}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PerformanceSection: React.FC<PerformanceSectionProps> = ({ projects }) => {
  
  const salesPerformance = useMemo(() => {
    const stats: Record<string, { name: string, count: number, revenue: number, issues: number }> = {};
    projects.forEach(p => {
      if (!stats[p.salesRep]) stats[p.salesRep] = { name: p.salesRep, count: 0, revenue: 0, issues: 0 };
      stats[p.salesRep].count += 1;
      stats[p.salesRep].revenue += p.valueSigned; // Sales judged by Signed Value
      stats[p.salesRep].issues += (p.complaints); // Sales judged by complaints mostly
    });
    return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
  }, [projects]);

  const implPerformance = useMemo(() => {
    const stats: Record<string, { name: string, count: number, revenue: number, issues: number }> = {};
    projects.forEach(p => {
      if (!stats[p.implRep]) stats[p.implRep] = { name: p.implRep, count: 0, revenue: 0, issues: 0 };
      stats[p.implRep].count += 1;
      stats[p.implRep].revenue += p.revenueRecognized; 
      stats[p.implRep].issues += (p.softwareErrors + p.daysLate > 0 ? 1 : 0); // Impl judged by execution
    });
    return Object.values(stats).sort((a, b) => b.count - a.count); // Most active
  }, [projects]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <PerformanceTable title="Hiệu suất Sales" data={salesPerformance} type="sales" />
      <PerformanceTable title="Hiệu suất Triển khai" data={implPerformance} type="impl" />
    </div>
  );
};

export default PerformanceSection;