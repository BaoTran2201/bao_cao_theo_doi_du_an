import React, { useState } from 'react';
import { ImportSource } from '../types';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft, X, Link, AlertCircle, FileText, Download } from 'lucide-react';

interface DataImportFlowProps {
  type: ImportSource;
  onCancel: () => void;
  onFinish: () => void;
}

const STEPS = [
  { id: 1, title: 'Upload / Connect' },
  { id: 2, title: 'Map Fields' },
  { id: 3, title: 'Validation' },
  { id: 4, title: 'Confirmation' },
];

const MOCK_MAPPING_FIELDS = [
  { system: 'Project Name', required: true, mapped: 'Tên dự án (Cột B)' },
  { system: 'Client Name', required: true, mapped: 'Khách hàng (Cột C)' },
  { system: 'Sales Owner', required: true, mapped: 'Nhân viên Sales (Cột E)' },
  { system: 'Contract Value', required: true, mapped: 'Giá trị HĐ (Cột G)' },
  { system: 'Start Date', required: false, mapped: 'Ngày bắt đầu (Cột H)' },
  { system: 'Deadline', required: true, mapped: 'Deadline (Cột I)' },
];

const DataImportFlow: React.FC<DataImportFlowProps> = ({ type, onCancel, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(c => c + 1);
    else onFinish();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  // --- STEP RENDERS ---

  const renderStep1 = () => (
    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in">
      {type === ImportSource.EXCEL ? (
        <div className="w-full max-w-lg">
           <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                 <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-lg font-medium text-slate-700 mb-2">Kéo thả file Excel (.xlsx) vào đây</p>
              <p className="text-sm text-slate-500 mb-6">hoặc click để chọn file từ máy tính</p>
              <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                 Chọn File
              </button>
           </div>
           <div className="mt-4 flex items-start p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-500 mr-2 shrink-0" />
              <p className="text-xs text-blue-700">
                 Vui lòng sử dụng <a href="#" className="underline font-bold">file mẫu chuẩn</a> để giảm thiểu lỗi định dạng dữ liệu. Hỗ trợ tối đa 5000 dòng/lần upload.
              </p>
           </div>
        </div>
      ) : (
        <div className="w-full max-w-lg">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-medium text-slate-700 mb-2">Google Sheet URL</label>
              <div className="flex gap-2">
                 <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                 </div>
                 <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    Kết nối
                 </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                 Đảm bảo sheet đã được chia sẻ quyền "Viewer" cho email hệ thống: <b>system@company.com</b>
              </p>
           </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-in slide-in-from-right-4">
      <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
         <div>
            <p className="text-sm font-bold text-slate-700">Nguồn: {type === ImportSource.EXCEL ? 'Du_lieu_thang_10.xlsx' : 'Master Project Tracking 2024'}</p>
            <p className="text-xs text-slate-500">Tìm thấy 1 sheet • 156 dòng dữ liệu</p>
         </div>
         <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">Connected</span>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="p-3 w-1/3">Trường dữ liệu hệ thống</th>
              <th className="p-3 w-1/3">Cột trong file nguồn</th>
              <th className="p-3 w-1/3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {MOCK_MAPPING_FIELDS.map((field, idx) => (
               <tr key={idx}>
                  <td className="p-3">
                     <span className="font-medium text-slate-700">{field.system}</span>
                     {field.required && <span className="text-red-500 ml-1">*</span>}
                  </td>
                  <td className="p-3">
                     <select className="w-full p-2 border border-slate-300 rounded bg-white text-slate-700">
                        <option>{field.mapped}</option>
                     </select>
                  </td>
                  <td className="p-3">
                     <div className="flex items-center text-emerald-600 text-xs font-medium">
                        <CheckCircle className="w-3 h-3 mr-1" /> OK
                     </div>
                  </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
         <button className="text-xs text-indigo-600 font-medium hover:underline">
            + Thêm trường mapping tùy chỉnh
         </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-in slide-in-from-right-4">
       <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
             <p className="text-xs text-slate-500 mb-1">Tổng số dòng</p>
             <p className="text-2xl font-bold text-slate-800">156</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
             <p className="text-xs text-emerald-600 mb-1 font-bold">Hợp lệ (Ready)</p>
             <p className="text-2xl font-bold text-emerald-700">148</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
             <p className="text-xs text-red-600 mb-1 font-bold">Lỗi (Error)</p>
             <p className="text-2xl font-bold text-red-700">8</p>
          </div>
       </div>

       {/* Error List */}
       <div className="border border-red-200 rounded-lg overflow-hidden mb-4">
          <div className="bg-red-50 px-4 py-2 border-b border-red-200 flex justify-between items-center">
             <h4 className="text-sm font-bold text-red-800 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Chi tiết lỗi (8 dòng)
             </h4>
             <button className="text-xs text-red-700 underline font-medium flex items-center">
                <Download className="w-3 h-3 mr-1" /> Tải báo cáo lỗi
             </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
             <table className="w-full text-left text-xs">
                <thead className="bg-white text-slate-500 border-b border-slate-100">
                   <tr>
                      <th className="p-3">Dòng số</th>
                      <th className="p-3">Dữ liệu</th>
                      <th className="p-3">Nguyên nhân lỗi</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                   {[12, 13, 45, 67, 89].map(row => (
                      <tr key={row} className="hover:bg-slate-50">
                         <td className="p-3 font-mono text-slate-500">#{row}</td>
                         <td className="p-3 font-bold text-slate-700">Dự án Alpha...</td>
                         <td className="p-3 text-red-600">Thiếu trường bắt buộc "Deadline"</td>
                      </tr>
                   ))}
                   <tr className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-500">#92</td>
                      <td className="p-3 font-bold text-slate-700">Dự án Beta...</td>
                      <td className="p-3 text-red-600">Định dạng ngày không hợp lệ</td>
                   </tr>
                </tbody>
             </table>
          </div>
       </div>

       <div className="flex items-center gap-2">
          <input type="checkbox" id="skipErrors" className="w-4 h-4 text-indigo-600 rounded" defaultChecked />
          <label htmlFor="skipErrors" className="text-sm text-slate-700">Tự động bỏ qua các dòng lỗi và chỉ import dòng hợp lệ.</label>
       </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="animate-in slide-in-from-right-4 flex flex-col items-center py-8">
       <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <ArrowRight className="w-8 h-8 text-blue-600" />
       </div>
       <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận Import Dữ liệu</h3>
       <p className="text-slate-500 mb-8 text-center max-w-md">
          Bạn sắp thực hiện import <b>148 dòng dữ liệu</b> vào hệ thống. Hành động này sẽ cập nhật các dự án có mã trùng khớp và tạo mới các dự án chưa tồn tại.
       </p>

       <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-lg w-full mb-6">
          <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center">
             <AlertTriangle className="w-4 h-4 mr-2" /> Cảnh báo quan trọng
          </h4>
          <ul className="list-disc list-inside text-xs text-amber-800 space-y-1 ml-1">
             <li>Dữ liệu trên hệ thống sẽ bị ghi đè nếu trùng mã dự án.</li>
             <li>Hành động này sẽ được ghi lại trong Audit Log.</li>
             <li>Bạn có thể Rollback trong vòng 24h nếu có sự cố.</li>
          </ul>
       </div>

       <div className="flex items-center gap-2 mb-8 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <input 
            type="checkbox" 
            id="confirm" 
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <label htmlFor="confirm" className="text-sm font-medium text-slate-800 cursor-pointer">
             Tôi hiểu rủi ro và xác nhận muốn import dữ liệu này.
          </label>
       </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-slate-800 flex items-center">
             {type === ImportSource.EXCEL ? <FileSpreadsheet className="w-5 h-5 mr-2 text-emerald-600" /> : <Link className="w-5 h-5 mr-2 text-blue-600" />}
             Import Dữ liệu ({type})
           </h3>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
           <X className="w-6 h-6" />
        </button>
      </div>

      {/* Stepper */}
      <div className="bg-white px-12 py-6 border-b border-slate-100">
         <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
            <div 
               className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-500 -z-10"
               style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
            
            {STEPS.map((step) => (
               <div key={step.id} className="flex flex-col items-center bg-white px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                     step.id <= currentStep ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-400'
                  }`}>
                     {step.id < currentStep ? <CheckCircle className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`text-xs font-medium mt-2 ${step.id <= currentStep ? 'text-indigo-600' : 'text-slate-400'}`}>{step.title}</span>
               </div>
            ))}
         </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
         {currentStep === 1 && renderStep1()}
         {currentStep === 2 && renderStep2()}
         {currentStep === 3 && renderStep3()}
         {currentStep === 4 && renderStep4()}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
         <button 
            onClick={currentStep === 1 ? onCancel : handleBack}
            className="px-6 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white transition-colors"
         >
            {currentStep === 1 ? 'Hủy bỏ' : 'Quay lại'}
         </button>
         
         <button 
            onClick={handleNext}
            disabled={currentStep === 4 && !confirmed}
            className={`px-6 py-2 rounded-lg text-sm font-bold text-white flex items-center transition-all ${
               currentStep === 4 && !confirmed ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200'
            }`}
         >
            {currentStep === 4 ? 'Xác nhận & Import' : 'Tiếp tục'}
            {currentStep < 4 && <ChevronRight className="w-4 h-4 ml-1" />}
         </button>
      </div>
    </div>
  );
};

// Helper for icon
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

export default DataImportFlow;
