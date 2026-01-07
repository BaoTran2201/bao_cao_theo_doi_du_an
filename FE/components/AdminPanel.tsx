import React, { useState } from 'react';
import PermissionMatrix from './PermissionMatrix';
import AuditLogTable from './AuditLogTable';
import DataManagementPanel from './DataManagementPanel';
import { Settings, Shield, FileText, ArrowLeft, Database } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'permission' | 'audit' | 'data'>('data');

  return (
    <div className="min-h-screen bg-slate-50 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <button onClick={onBack} className="flex items-center text-sm text-slate-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại Dashboard
          </button>
          
          <div className="flex items-center gap-4">
             <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                <Settings className="w-6 h-6 text-indigo-400" />
             </div>
             <div>
                <h1 className="text-2xl font-bold tracking-tight">Hệ thống Quản trị & Giám sát</h1>
                <p className="text-sm text-slate-400">Governance • Permissions • Audit Logs • Data</p>
             </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1600px] mx-auto px-6 flex gap-6 mt-4 overflow-x-auto">
           <button 
             onClick={() => setActiveTab('data')}
             className={`flex items-center pb-3 px-2 border-b-2 transition-all font-medium text-sm whitespace-nowrap ${
               activeTab === 'data' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
             }`}
           >
             <Database className="w-4 h-4 mr-2" />
             Quản lý Dữ liệu
           </button>
           <button 
             onClick={() => setActiveTab('audit')}
             className={`flex items-center pb-3 px-2 border-b-2 transition-all font-medium text-sm whitespace-nowrap ${
               activeTab === 'audit' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
             }`}
           >
             <FileText className="w-4 h-4 mr-2" />
             Nhật ký Hệ thống (Audit Log)
           </button>
           <button 
             onClick={() => setActiveTab('permission')}
             className={`flex items-center pb-3 px-2 border-b-2 transition-all font-medium text-sm whitespace-nowrap ${
               activeTab === 'permission' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
             }`}
           >
             <Shield className="w-4 h-4 mr-2" />
             Phân quyền (Permissions)
           </button>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 mt-8">
         {activeTab === 'permission' && (
           <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                 <h2 className="text-xl font-bold text-slate-800">Quản lý Phân quyền</h2>
                 <p className="text-slate-500">Thiết lập quyền hạn truy cập cho các nhóm người dùng trong hệ thống.</p>
              </div>
              <PermissionMatrix />
           </div>
         )}
         
         {activeTab === 'audit' && (
           <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                 <h2 className="text-xl font-bold text-slate-800">Nhật ký Hoạt động</h2>
                 <p className="text-slate-500">Theo dõi toàn bộ thay đổi dữ liệu và tác vụ quan trọng để đảm bảo tính minh bạch.</p>
              </div>
              <AuditLogTable />
           </div>
         )}

         {activeTab === 'data' && (
            <DataManagementPanel />
         )}
      </main>

    </div>
  );
};

export default AdminPanel;
