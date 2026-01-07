import React, { useMemo } from 'react';
import { Project, ProjectStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartsSectionProps {
  projects: Project[];
}

const STATUS_COLORS: Record<string, string> = {
  "Đã hoàn thành": '#10b981', // emerald-500
  "Đang thực hiện": '#3b82f6', // blue-500
  "Trễ hạn": '#ef4444', // red-500
  "Đang treo": '#f59e0b', // amber-500
  "Chưa bắt đầu": '#94a3b8', // slate-400
  "Chờ nghiệm thu": '#8b5cf6', // violet-500
  "Chờ thanh lý": '#6366f1', // indigo-500
  "Chờ thu tiền": '#ec4899', // pink-500
};

const ChartsSection: React.FC<ChartsSectionProps> = ({ projects }) => {
  
  // Prepare data for Bar Chart (Revenue vs Signed by Month - 2025 focus)
  const barData = useMemo(() => {
    const data: Record<string, any> = {};
    // Filter for 2025 to make the chart cleaner, or group all. Let's group all by Month-Year if needed or just Month across years.
    // For Dashboard Trend, let's group by Month of the current year (2025 based on data volume) or just general Monthly trend.
    // Given the dataset spans 2024-2025, let's group by Month-Year string.
    
    projects.forEach(p => {
      const key = `T${p.signMonth}/${p.signYear}`;
      // Sort key helper
      const sortKey = p.signYear * 100 + p.signMonth;
      
      if (!data[key]) {
        data[key] = { name: key, sortKey, Signed: 0, Revenue: 0 };
      }
      data[key].Signed += p.valueSigned;
      data[key].Revenue += p.revenueRecognized;
    });
    
    return Object.values(data).sort((a, b) => a.sortKey - b.sortKey);
  }, [projects]);

  // Prepare data for Status Pie Chart
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      const status = p.status || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [projects]);

  // Prepare Sales Pie Chart (Top 5 for cleaner UI)
  const salesData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      const name = p.salesRep || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Take top 5
  }, [projects]);

  const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Main Bar Chart */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Xu hướng tài chính</h3>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">Theo tháng</span>
          </div>
        </div>
        <div className="h-[300px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis 
                tickFormatter={(val) => `${val / 1000000000}B`} 
                tick={{fill: '#64748b'}} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" />
              <Bar dataKey="Signed" fill="#6366f1" radius={[4, 4, 0, 0]} name="Giá trị ký" />
              <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donuts Column */}
      <div className="flex flex-col gap-6">
        
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex-1">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Trạng thái dự án</h3>
          <div className="h-[200px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Volume */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex-1">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Dự án theo Sales (Top 5)</h3>
          <div className="h-[150px] text-xs">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={salesData} margin={{top:0, left:0, right:30, bottom:0}}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12}>
                     {salesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
              </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChartsSection;
