import React, { useState } from 'react';
import { ImportSource, ImportStatus } from '../types';
import { MOCK_IMPORT_HISTORY } from '../mockData';
import DataImportFlow from './DataImportFlow';
import { 
  Database, FileSpreadsheet, Link, Clock, RotateCcw, 
  CheckCircle, AlertTriangle, ArrowRight, Settings, Download 
} from 'lucide-react';

const DataManagementPanel: React.FC = () => {
  const [activeFlow, setActiveFlow] = useState<ImportSource | null>(null);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status: ImportStatus) => {
    switch (status) {
      case ImportStatus.SUCCESS:
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1" /> Success</span>;
      case ImportStatus.FAILED:
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center w-fit"><AlertTriangle className="w-3 h-3 mr-1" /> Failed</span>;
      case ImportStatus.PARTIAL:
        return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold flex items-center w-fit"><AlertTriangle className="w-3 h-3 mr-1" /> Partial</span>;
    }
  };

  if (activeFlow) {
    return (
      <div className="animate-in fade-in duration-300">
         <DataImportFlow 
            type={activeFlow} 
            onCancel={() => setActiveFlow(null)} 
            onFinish={() => {
               alert("Import process simulated successfully!");
               setActiveFlow(null);
            }} 
         />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      
      {/* Header Section */}
      <div>
         <h2 className="text-xl font-bold text-slate-800">Quản lý Dữ liệu Nguồn</h2>
         <p className="text-slate-500">Nhập liệu, đồng bộ và kiểm soát luồng dữ liệu vào hệ thống.</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Card 1: Excel */}
         <div 
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => setActiveFlow(ImportSource.EXCEL)}
         >
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Import Excel</h3>
            <p className="text-sm text-slate-500 mb-4">Nhập dữ liệu mới hoặc backup từ file .xlsx. Hỗ trợ mapping cột thủ công.</p>
            <div className="flex items-center text-sm font-bold text-emerald-600">
               Bắt đầu ngay <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
         </div>

         {/* Card 2: Google Sheet */}
         <div 
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => setActiveFlow(ImportSource.GSHEET)}
         >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Link className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sync Google Sheet</h3>
            <p className="text-sm text-slate-500 mb-4">Kết nối và đồng bộ dữ liệu định kỳ từ Google Sheet hiện có.</p>
            <div className="flex items-center text-sm font-bold text-blue-600">
               Kết nối Sheet <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
         </div>

         {/* Card 3: Settings */}
         <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Settings className="w-24 h-24 text-slate-900" />
            </div>
            <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mb-4">
               <Settings className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Cấu hình Đồng bộ</h3>
            <p className="text-sm text-slate-500 mb-4">
               Chế độ: <span className="font-bold text-slate-700">Semi-Auto (Weekly)</span><br/>
               Lần sync cuối: 10/05/2024
            </p>
            <button className="text-sm font-bold text-slate-600 hover:text-slate-900 underline">
               Thay đổi cài đặt
            </button>
         </div>
      </div>

      {/* Import History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center">
               <Clock className="w-4 h-4 mr-2 text-slate-500" /> Lịch sử Import & Đồng bộ
            </h3>
            <button className="text-xs text-indigo-600 font-medium hover:underline flex items-center">
               <Download className="w-3 h-3 mr-1" /> Xuất báo cáo
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                     <th className="px-6 py-3">Thời gian</th>
                     <th className="px-6 py-3">Nguồn / File</th>
                     <th className="px-6 py-3">Người thực hiện</th>
                     <th className="px-6 py-3 text-center">Kết quả (Dòng)</th>
                     <th className="px-6 py-3">Trạng thái</th>
                     <th className="px-6 py-3 text-right">Thao tác</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {MOCK_IMPORT_HISTORY.map((log) => (
                     <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-slate-600 font-mono text-xs">{formatDate(log.timestamp)}</td>
                        <td className="px-6 py-3">
                           <div className="font-medium text-slate-800">{log.fileName}</div>
                           <div className="text-xs text-slate-500 flex items-center">
                              {log.source === ImportSource.EXCEL ? <FileSpreadsheet className="w-3 h-3 mr-1 text-emerald-500" /> : <Link className="w-3 h-3 mr-1 text-blue-500" />}
                              {log.source}
                           </div>
                        </td>
                        <td className="px-6 py-3 text-slate-600">{log.importedBy}</td>
                        <td className="px-6 py-3 text-center">
                           <div className="text-xs">
                              <span className="text-emerald-600 font-bold">{log.rowsSuccess}</span> / <span className="text-slate-500">{log.rowsTotal}</span>
                           </div>
                        </td>
                        <td className="px-6 py-3">{getStatusBadge(log.status)}</td>
                        <td className="px-6 py-3 text-right">
                           <button 
                              className="text-slate-400 hover:text-red-600 flex items-center justify-end w-full text-xs font-medium transition-colors"
                              title="Rollback (Hoàn tác)"
                           >
                              <RotateCcw className="w-3 h-3 mr-1" /> Rollback
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
};

export default DataManagementPanel;
