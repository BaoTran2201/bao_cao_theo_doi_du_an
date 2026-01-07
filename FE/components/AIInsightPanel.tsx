import React from 'react';
import { AIInsight, InsightCategory, InsightSeverity } from '../types';
import { Sparkles, AlertTriangle, Users, TrendingUp, DollarSign, MessageSquare, ArrowRight, X } from 'lucide-react';

interface AIInsightPanelProps {
  insights: AIInsight[];
  title?: string;
  onClose?: () => void;
  className?: string;
  variant?: 'sidebar' | 'inline' | 'compact';
}

const CategoryIcon = ({ category }: { category: InsightCategory }) => {
  switch (category) {
    case InsightCategory.SCHEDULE: return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case InsightCategory.PEOPLE: return <Users className="w-4 h-4 text-blue-500" />;
    case InsightCategory.FINANCIAL: return <DollarSign className="w-4 h-4 text-emerald-500" />;
    case InsightCategory.QUALITY: return <TrendingUp className="w-4 h-4 text-purple-500" />;
    case InsightCategory.CLIENT: return <MessageSquare className="w-4 h-4 text-orange-500" />;
    default: return <Sparkles className="w-4 h-4 text-indigo-500" />;
  }
};

const SeverityBadge = ({ severity }: { severity: InsightSeverity }) => {
  const colors = {
    [InsightSeverity.HIGH]: "bg-red-100 text-red-700 border-red-200",
    [InsightSeverity.MEDIUM]: "bg-orange-100 text-orange-700 border-orange-200",
    [InsightSeverity.LOW]: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${colors[severity]}`}>
      {severity}
    </span>
  );
};

const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ 
  insights, 
  title = "AI Executive Briefing", 
  onClose,
  className = "",
  variant = 'sidebar'
}) => {
  
  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${variant === 'sidebar' ? 'p-5 border-b border-slate-100' : 'mb-4'}`}>
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-1.5 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">{title}</h3>
            {variant === 'sidebar' && <p className="text-xs text-slate-500">Phân tích tự động từ dữ liệu dự án</p>}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* List */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${variant === 'sidebar' ? 'p-5' : ''} space-y-3`}>
        {insights.length === 0 ? (
           <div className="text-center py-8 text-slate-500 text-sm">
             Không có insight nào cần chú ý lúc này.
           </div>
        ) : (
          insights.map((insight) => (
            <div 
              key={insight.id} 
              className={`
                group relative bg-white border rounded-xl p-4 transition-all hover:shadow-md
                ${insight.severity === InsightSeverity.HIGH ? 'border-l-4 border-l-red-500 border-slate-200 bg-red-50/10' : 
                  insight.severity === InsightSeverity.MEDIUM ? 'border-l-4 border-l-orange-500 border-slate-200 bg-orange-50/10' : 
                  'border-l-4 border-l-slate-300 border-slate-200'}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <CategoryIcon category={insight.category} />
                  <span className="text-xs font-semibold text-slate-500 uppercase">{insight.category}</span>
                </div>
                <SeverityBadge severity={insight.severity} />
              </div>
              
              <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                {insight.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {insight.description}
              </p>

              {insight.actionLabel && (
                <button className="text-xs font-medium text-indigo-600 flex items-center group-hover:underline">
                  {insight.actionLabel}
                  <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {variant === 'sidebar' && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-center text-slate-400">
           AI Insight được cập nhật realtime (09:41 AM)
        </div>
      )}
    </div>
  );
};

export default AIInsightPanel;
