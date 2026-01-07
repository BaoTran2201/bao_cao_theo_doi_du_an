import React from 'react';
import { KPIStats } from '../types';
import { LayoutList, DollarSign, TrendingDown, TrendingUp, AlertTriangle, AlertOctagon } from 'lucide-react';

interface KpiSectionProps {
  stats: KPIStats;
}

const KpiCard: React.FC<{
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'red' | 'orange' | 'purple';
  comparisonText?: string;
}> = ({ title, value, subValue, icon, trend, color, comparisonText }) => {
  
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700",
    purple: "bg-indigo-50 text-indigo-700",
  };

  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-slate-400';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-xl font-bold text-slate-900 mt-1 truncate max-w-[200px]" title={value}>{value}</h3>
          {subValue && <p className="text-sm text-slate-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      {comparisonText && (
        <div className="flex items-center text-xs font-medium">
          {TrendIcon && <TrendIcon className={`w-3 h-3 mr-1 ${trendColor}`} />}
          <span className={`${trendColor} mr-1`}>{trend === 'up' ? '+' : ''}</span>
          <span className="text-slate-500">{comparisonText}</span>
        </div>
      )}
    </div>
  );
};

const KpiSection: React.FC<KpiSectionProps> = ({ stats }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
      // notation: 'compact', // Removed to show full value
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <KpiCard 
        title="Tổng số dự án" 
        value={stats.totalProjects.toString()} 
        icon={<LayoutList className="w-5 h-5" />} 
        color="blue"
        trend="up"
        comparisonText="dữ liệu thực tế"
      />
      
      <KpiCard 
        title="Giá trị ký" 
        value={formatCurrency(stats.totalValue)} 
        icon={<DollarSign className="w-5 h-5" />} 
        color="green"
        trend="up"
        comparisonText="Tổng giá trị hợp đồng"
      />

      <KpiCard 
        title="Doanh thu" 
        value={formatCurrency(stats.totalRevenue)} 
        icon={<DollarSign className="w-5 h-5" />} 
        color="green"
        trend="up"
        comparisonText="Đã ghi nhận"
      />
      
      <KpiCard 
        title="Giá trị còn lại" 
        value={formatCurrency(stats.remainingValue)} 
        icon={<DollarSign className="w-5 h-5" />} 
        color="purple"
        comparisonText="Doanh thu tương lai"
      />

      <KpiCard 
        title="Dự án trễ" 
        value={`${stats.latePercentage.toFixed(1)}%`}
        icon={<AlertOctagon className="w-5 h-5" />} 
        color="red"
        trend={stats.latePercentage > 10 ? 'down' : 'up'} 
        comparisonText={stats.latePercentage > 15 ? "Mức nghiêm trọng" : "Trong tầm kiểm soát"}
      />

      <KpiCard 
        title="Vấn đề chất lượng" 
        value={`${stats.errorPercentage.toFixed(1)}%`}
        icon={<AlertTriangle className="w-5 h-5" />} 
        color="orange"
        comparisonText="Dự án có lỗi"
      />
    </div>
  );
};

export default KpiSection;