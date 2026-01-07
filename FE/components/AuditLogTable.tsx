import React, { useState } from 'react';
import { MOCK_AUDIT_LOGS } from '../mockData';
import { AuditAction, AuditLogEntry, UserRole } from '../types';
import { Search, Filter, Calendar, ChevronDown, ChevronRight, Clock, User, Tag, ArrowRight } from 'lucide-react';

const AuditLogTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredLogs = MOCK_AUDIT_LOGS.filter(log => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction ? log.action === selectedAction : true;
    const matchesRole = selectedRole ? log.userRole === selectedRole : true;

    return matchesSearch && matchesAction && matchesRole;
  });

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case AuditAction.CREATE: return 'text-emerald-600 bg-emerald-50';
      case AuditAction.UPDATE: return 'text-blue-600 bg-blue-50';
      case AuditAction.DELETE: return 'text-red-600 bg-red-50';
      case AuditAction.LOGIN: return 'text-slate-600 bg-slate-100';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo user, mô tả, ID đối tượng..." 
            className="w-full pl-9 p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative">
             <select 
               className="appearance-none pl-9 pr-8 p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-indigo-500 outline-none"
               value={selectedRole}
               onChange={(e) => setSelectedRole(e.target.value)}
             >
               <option value="">Tất cả Role</option>
               {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
             </select>
             <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
             <select 
               className="appearance-none pl-9 pr-8 p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-indigo-500 outline-none"
               value={selectedAction}
               onChange={(e) => setSelectedAction(e.target.value)}
             >
               <option value="">Tất cả Hành động</option>
               {Object.values(AuditAction).map(a => <option key={a} value={a}>{a}</option>)}
             </select>
             <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
             <button className="flex items-center px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white hover:bg-slate-50 text-slate-600">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                Thời gian
             </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 w-8"></th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Người dùng</th>
                <th className="p-4">Hành động</th>
                <th className="p-4">Đối tượng</th>
                <th className="p-4">Mô tả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr 
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedRow === log.id ? 'bg-indigo-50/50' : ''}`}
                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                  >
                    <td className="p-4 text-slate-400">
                      {expandedRow === log.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-600 font-mono text-xs">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{log.userName}</div>
                      <div className="text-xs text-slate-500">{log.userRole}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                       <span className="text-slate-600 font-medium">{log.targetType}</span>
                       <span className="text-slate-400 text-xs ml-1 font-mono">#{log.targetId}</span>
                    </td>
                    <td className="p-4 text-slate-700 max-w-xs truncate">
                      {log.description}
                    </td>
                  </tr>
                  
                  {/* Expanded Detail View */}
                  {expandedRow === log.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={6} className="p-0">
                        <div className="p-6 border-t border-slate-100 border-b border-indigo-100 bg-white/50 animate-in slide-in-from-top-2">
                           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Chi tiết thay đổi</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                 <p className="text-xs text-slate-500 mb-1 font-semibold">Giá trị cũ</p>
                                 <p className="text-sm font-mono text-slate-600">{log.oldValue || <span className="text-slate-400 italic">null</span>}</p>
                              </div>
                              <div className="bg-indigo-50 p-3 rounded border border-indigo-100 flex items-center">
                                 <ArrowRight className="w-4 h-4 text-indigo-400 mr-3 shrink-0" />
                                 <div className="w-full">
                                    <p className="text-xs text-indigo-600 mb-1 font-semibold">Giá trị mới</p>
                                    <p className="text-sm font-mono text-slate-900">{log.newValue || <span className="text-slate-400 italic">null</span>}</p>
                                 </div>
                              </div>
                           </div>
                           <div className="mt-4 text-xs text-slate-400 font-mono">
                             Log ID: {log.id} • User ID: {log.userId}
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Mock */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
           <span>Hiển thị {filteredLogs.length} bản ghi</span>
           <div className="flex gap-1">
             <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Trước</button>
             <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">Sau</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogTable;
