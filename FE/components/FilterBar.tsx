import React, { useState } from 'react';
import { FilterState, ProjectStatus, RiskLevel } from '../types';
import { ALL_YEARS, ALL_SALES, ALL_IMPL } from '../mockData';
import { FilterX, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, onReset }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const selectClass = "bg-white border border-slate-300 text-slate-700 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2";
  const labelClass = "block text-xs font-medium text-slate-500 mb-1";

  // Count active filters
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-slate-200 py-3 px-4 transition-all">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Mobile Toggle Header */}
        <div className="flex lg:hidden justify-between items-center mb-2">
           <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="flex items-center text-sm font-medium text-slate-700 bg-slate-100 px-3 py-2 rounded-lg"
           >
             <Filter className="w-4 h-4 mr-2" />
             Bộ lọc {activeCount > 0 && <span className="ml-1 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeCount}</span>}
             {isExpanded ? <ChevronUp className="w-4 h-4 ml-2 text-slate-400" /> : <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />}
           </button>

           {activeCount > 0 && (
             <button 
                onClick={onReset}
                className="text-xs text-slate-500 flex items-center"
             >
                <FilterX className="w-3 h-3 mr-1" /> Xóa lọc
             </button>
           )}
        </div>

        <div className={`flex flex-col lg:flex-row gap-3 items-end lg:items-center justify-between ${isExpanded ? 'block' : 'hidden lg:flex'}`}>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
            {/* Year */}
            <div>
              <label className={labelClass}>Năm</label>
              <select 
                value={filters.year} 
                onChange={(e) => handleChange('year', e.target.value)} 
                className={selectClass}
              >
                <option value="">Tất cả các năm</option>
                {ALL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className={labelClass}>Tháng</label>
              <select 
                value={filters.month} 
                onChange={(e) => handleChange('month', e.target.value)} 
                className={selectClass}
              >
                <option value="">Tất cả các tháng</option>
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
            </div>

            {/* Sales Rep */}
            <div>
              <label className={labelClass}>Nhân viên Sales</label>
              <select 
                value={filters.salesRep} 
                onChange={(e) => handleChange('salesRep', e.target.value)} 
                className={selectClass}
              >
                <option value="">Tất cả Sales</option>
                {ALL_SALES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Impl Rep */}
            <div>
              <label className={labelClass}>Nhân viên Triển khai</label>
              <select 
                value={filters.implRep} 
                onChange={(e) => handleChange('implRep', e.target.value)} 
                className={selectClass}
              >
                <option value="">Tất cả Triển khai</option>
                {ALL_IMPL.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

             {/* Status */}
             <div>
              <label className={labelClass}>Trạng thái</label>
              <select 
                value={filters.status} 
                onChange={(e) => handleChange('status', e.target.value)} 
                className={selectClass}
              >
                <option value="">Tất cả trạng thái</option>
                {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

             {/* Risk */}
             <div>
              <label className={labelClass}>Mức độ rủi ro</label>
              <select 
                value={filters.riskLevel} 
                onChange={(e) => handleChange('riskLevel', e.target.value)} 
                className={selectClass}
              >
                <option value="">Tất cả rủi ro</option>
                {Object.values(RiskLevel).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <button 
            onClick={onReset}
            className="hidden lg:flex mt-2 lg:mt-0 lg:ml-4 items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 whitespace-nowrap h-[38px] self-end"
          >
            <FilterX className="w-4 h-4 mr-2" />
            Đặt lại
          </button>

        </div>
      </div>
    </div>
  );
};

export default FilterBar;