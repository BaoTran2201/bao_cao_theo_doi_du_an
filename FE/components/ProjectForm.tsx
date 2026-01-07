import React, { useState, useMemo, useEffect } from 'react';
import { Project, ProjectStatus, ProjectType } from '../types';
import { ALL_SALES, ALL_IMPL } from '../mockData';
import { 
  ArrowLeft, CheckCircle, ChevronRight, Save, 
  AlertTriangle, DollarSign, Calendar, FileText, 
  Briefcase, User, Info, AlertCircle, Edit2, ShieldCheck, X
} from 'lucide-react';

interface ProjectFormProps {
  onCancel: () => void;
  onSave: (project: Partial<Project>) => void;
  initialData?: Project; // If editing
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onCancel, onSave, initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = !!initialData;
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Default Form State
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    client: '',
    signYear: new Date().getFullYear(),
    signMonth: new Date().getMonth() + 1,
    salesRep: '',
    valueSigned: 0,
    revenueRecognized: 0,
    
    // Step 2 defaults
    implRep: '',
    kickoffDate: '',
    deadline: '',
    status: ProjectStatus.NOT_STARTED,
    projectType: ProjectType.NEW,
    
    // Step 3 defaults
    managerNote: '',
    managerRating: 5,
    issueAttitude: false,
    issueSpec: false,
    issueClient: false,
    softwareErrors: 0,
    complaints: 0,
  });

  // Load initial data on mount
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // --- HELPERS ---
  const handleChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getChangedFields = () => {
    if (!initialData) return [];
    const changed: {field: string, old: any, new: any}[] = [];
    (Object.keys(formData) as Array<keyof Project>).forEach(key => {
      // Basic comparison, works for primitives in this specific data structure
      if (formData[key] !== initialData[key]) {
        changed.push({
          field: key,
          old: initialData[key],
          new: formData[key]
        });
      }
    });
    return changed;
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!initialData) return false;
    return getChangedFields().length > 0;
  }, [formData, initialData]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.name) newErrors.name = "Vui lòng nhập tên dự án";
      if (!formData.client) newErrors.client = "Vui lòng nhập tên khách hàng";
      if (!formData.salesRep) newErrors.salesRep = "Vui lòng chọn Sales phụ trách";
      if (!formData.valueSigned || formData.valueSigned <= 0) newErrors.valueSigned = "Giá trị ký phải lớn hơn 0";
    }

    if (step === 2) {
      if (!formData.implRep) newErrors.implRep = "Vui lòng chọn nhân sự triển khai";
      if (!formData.kickoffDate) newErrors.kickoffDate = "Vui lòng chọn ngày Kickoff";
      if (!formData.deadline) newErrors.deadline = "Vui lòng chọn Deadline";
      
      // Logic validation
      if (formData.kickoffDate && formData.deadline && formData.deadline < formData.kickoffDate) {
        newErrors.deadline = "Deadline phải sau ngày Kickoff";
      }

      // Edit Mode Conditional Logic
      if (formData.status === ProjectStatus.COMPLETED && !formData.completionDate) {
         newErrors.completionDate = "Bắt buộc nhập ngày hoàn thành thực tế";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSaveClick = () => {
    if (isEditMode) {
      if (!hasUnsavedChanges) {
        alert("Không có thay đổi nào để lưu.");
        return;
      }
      setShowConfirmation(true);
    } else {
      onSave(formData);
    }
  };

  const handleConfirmSave = () => {
    onSave(formData);
    setShowConfirmation(false);
  };

  // --- COMPUTED VALUES FOR SUMMARY (STEP 4) ---
  const summary = useMemo(() => {
    const signed = formData.valueSigned || 0;
    const revenue = formData.revenueRecognized || 0;
    const remaining = signed - revenue;
    
    // Calculate Days Late (Simplified logic)
    let daysLate = 0;
    if (formData.deadline) {
        const today = new Date();
        const deadline = new Date(formData.deadline);
        if (formData.status !== ProjectStatus.COMPLETED && today > deadline) {
            const diffTime = Math.abs(today.getTime() - deadline.getTime());
            daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        }
    }
    
    const totalIssues = (formData.softwareErrors || 0) + (formData.issueSpec ? 1 : 0) + (formData.issueAttitude ? 1 : 0);

    return { signed, revenue, remaining, daysLate, totalIssues };
  }, [formData]);

  // --- UI HELPERS ---
  const isFieldChanged = (field: keyof Project) => {
    return isEditMode && initialData && formData[field] !== initialData[field];
  };

  const InputWrapper = ({ label, error, required, changed, children }: any) => (
    <div className={`mb-4 relative transition-all ${changed ? 'bg-yellow-50/50 p-2 -m-2 rounded-lg' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {changed && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">Modified</span>}
      </div>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  // --- SUB-COMPONENT: CONFIRMATION MODAL ---
  const ConfirmationModal = () => (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-indigo-600" />
            Xác nhận thay đổi
          </h3>
          <button onClick={() => setShowConfirmation(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-slate-600 mb-4">
            Bạn sắp cập nhật thông tin cho dự án <b>{formData.name}</b>. Hành động này sẽ được ghi lại trong Audit Log hệ thống.
          </p>
          
          <div className="space-y-3">
            {getChangedFields().map((change, idx) => (
              <div key={idx} className="text-xs border border-slate-200 rounded p-2 bg-slate-50">
                <span className="font-bold text-slate-700 uppercase block mb-1">{change.field}</span>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 line-through opacity-70">{String(change.old || '(Trống)')}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-emerald-600 font-bold">{String(change.new)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex gap-3 justify-end bg-slate-50 rounded-b-xl">
          <button 
            onClick={() => setShowConfirmation(false)}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white border border-transparent hover:border-slate-300 rounded-lg transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleConfirmSave}
            className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
          >
            Xác nhận Lưu
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={onCancel} className="mr-4 text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center">
                {isEditMode ? 'Chỉnh sửa Dự án' : 'Tạo Dự án Mới'}
                {isEditMode && <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">ID: {initialData?.id}</span>}
              </h1>
              {isEditMode && <p className="text-xs text-slate-500">{formData.client}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4">
             {isEditMode && hasUnsavedChanges && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 flex items-center animate-pulse">
                   <AlertCircle className="w-3 h-3 mr-1" /> Unsaved Changes
                </span>
             )}
             <div className="text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-lg">
                Bước {currentStep} / 4
             </div>
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="w-full max-w-4xl mt-8 px-6">
        
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"></div>
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={`flex flex-col items-center bg-white px-2 cursor-pointer ${step > currentStep ? 'opacity-50' : ''}`}
                   onClick={() => step < currentStep && setCurrentStep(step)}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                    ${step === currentStep ? 'border-indigo-600 bg-indigo-600 text-white' : 
                      step < currentStep ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-slate-400'}
                  `}
                >
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                <span className={`text-xs font-medium mt-2 ${step === currentStep ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {step === 1 ? 'Cơ bản' : step === 2 ? 'Triển khai' : step === 3 ? 'Chất lượng' : 'Tổng kết'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          
          {/* STEP 1: BASIC INFO */}
          {currentStep === 1 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                Thông tin Hợp đồng & Cơ bản
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputWrapper label="Tên dự án" required error={errors.name} changed={isFieldChanged('name')}>
                  <input 
                    type="text" 
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-300'} ${isFieldChanged('name') ? 'border-yellow-400' : ''}`}
                    placeholder="VD: Triển khai ERP Phase 1..."
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </InputWrapper>

                <InputWrapper label="Khách hàng" required error={errors.client} changed={isFieldChanged('client')}>
                  <input 
                    type="text" 
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${errors.client ? 'border-red-300 bg-red-50' : 'border-slate-300'} ${isFieldChanged('client') ? 'border-yellow-400' : ''}`}
                    placeholder="VD: TechCorp..."
                    value={formData.client}
                    onChange={(e) => handleChange('client', e.target.value)}
                  />
                </InputWrapper>

                <InputWrapper label="Năm ký" required>
                  <select 
                    className={`w-full p-2 border border-slate-300 rounded-md ${isEditMode ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                    value={formData.signYear}
                    disabled={isEditMode}
                    onChange={(e) => handleChange('signYear', parseInt(e.target.value))}
                  >
                    {[2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {isEditMode && <p className="text-[10px] text-slate-400 mt-1 italic">Read-only in Edit Mode</p>}
                </InputWrapper>

                <InputWrapper label="Tháng ký" required>
                  <select 
                    className={`w-full p-2 border border-slate-300 rounded-md ${isEditMode ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                    value={formData.signMonth}
                    disabled={isEditMode}
                    onChange={(e) => handleChange('signMonth', parseInt(e.target.value))}
                  >
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                  </select>
                  {isEditMode && <p className="text-[10px] text-slate-400 mt-1 italic">Read-only in Edit Mode</p>}
                </InputWrapper>

                <InputWrapper label="Nhân viên Sales" required error={errors.salesRep} changed={isFieldChanged('salesRep')}>
                  <select 
                    className={`w-full p-2 border rounded-md bg-white ${errors.salesRep ? 'border-red-300' : 'border-slate-300'} ${isFieldChanged('salesRep') ? 'border-yellow-400' : ''}`}
                    value={formData.salesRep}
                    onChange={(e) => handleChange('salesRep', e.target.value)}
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {ALL_SALES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </InputWrapper>

                 <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <InputWrapper label="Giá trị hợp đồng (VND)" required error={errors.valueSigned} changed={isFieldChanged('valueSigned')}>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="number" 
                          className={`w-full pl-9 p-2 border rounded-md font-mono ${errors.valueSigned ? 'border-red-300' : 'border-slate-300'} ${isFieldChanged('valueSigned') ? 'border-yellow-400' : ''}`}
                          value={formData.valueSigned}
                          onChange={(e) => handleChange('valueSigned', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Doanh thu đã ghi nhận (VND)" changed={isFieldChanged('revenueRecognized')}>
                      <div className="relative">
                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                        <input 
                          type="number" 
                          className={`w-full pl-9 p-2 border border-slate-300 rounded-md font-mono ${isFieldChanged('revenueRecognized') ? 'border-yellow-400' : ''}`}
                          value={formData.revenueRecognized}
                          onChange={(e) => handleChange('revenueRecognized', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Để trống nếu chưa có doanh thu</p>
                    </InputWrapper>
                 </div>
              </div>
            </div>
          )}

          {/* STEP 2: IMPLEMENTATION */}
          {currentStep === 2 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
                Thông tin Triển khai
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <InputWrapper label="Nhân viên Triển khai (Lead)" required error={errors.implRep} changed={isFieldChanged('implRep')}>
                  <select 
                    className={`w-full p-2 border rounded-md bg-white ${errors.implRep ? 'border-red-300' : 'border-slate-300'} ${isFieldChanged('implRep') ? 'border-yellow-400' : ''}`}
                    value={formData.implRep}
                    onChange={(e) => handleChange('implRep', e.target.value)}
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {ALL_IMPL.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </InputWrapper>

                <InputWrapper label="Loại dự án" changed={isFieldChanged('projectType')}>
                   <select 
                    className={`w-full p-2 border border-slate-300 rounded-md bg-white ${isFieldChanged('projectType') ? 'border-yellow-400' : ''}`}
                    value={formData.projectType}
                    onChange={(e) => handleChange('projectType', e.target.value)}
                  >
                    {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </InputWrapper>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <InputWrapper label="Ngày Kickoff" required error={errors.kickoffDate} changed={isFieldChanged('kickoffDate')}>
                      <input 
                        type="date" 
                        className={`w-full p-2 border rounded-md ${errors.kickoffDate ? 'border-red-300' : 'border-slate-300'} ${isFieldChanged('kickoffDate') ? 'border-yellow-400' : ''}`}
                        value={formData.kickoffDate}
                        onChange={(e) => handleChange('kickoffDate', e.target.value)}
                      />
                   </InputWrapper>

                   <InputWrapper label="Deadline cam kết" required error={errors.deadline} changed={isFieldChanged('deadline')}>
                      <input 
                        type="date" 
                        className={`w-full p-2 border rounded-md ${errors.deadline ? 'border-red-300' : 'border-slate-300'} ${isFieldChanged('deadline') ? 'border-yellow-400' : ''}`}
                        value={formData.deadline}
                        onChange={(e) => handleChange('deadline', e.target.value)}
                      />
                   </InputWrapper>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-slate-100">
                  <InputWrapper label="Trạng thái hiện tại" changed={isFieldChanged('status')}>
                    <select 
                      className={`w-full p-2 border border-slate-300 rounded-md bg-white font-medium text-slate-700 ${isFieldChanged('status') ? 'border-yellow-400' : ''}`}
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                    >
                      {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </InputWrapper>
                  
                  {formData.status === ProjectStatus.COMPLETED && (
                    <div className="mt-4 animate-in fade-in">
                       <InputWrapper label="Ngày hoàn thành thực tế" required error={errors.completionDate} changed={isFieldChanged('completionDate')}>
                        <input 
                          type="date" 
                          className={`w-full p-2 border border-emerald-300 bg-emerald-50 rounded-md text-emerald-900 ${isFieldChanged('completionDate') ? 'border-yellow-400' : ''} ${errors.completionDate ? 'border-red-300 bg-red-50' : ''}`}
                          value={formData.completionDate || ''}
                          onChange={(e) => handleChange('completionDate', e.target.value)}
                        />
                       </InputWrapper>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: QUALITY & ISSUES */}
          {currentStep === 3 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-indigo-500" />
                  Đánh giá & Vấn đề tồn đọng
                </h2>
                {isEditMode && <span className="text-xs text-slate-400 italic">Cập nhật lần cuối: Hôm nay 09:00</span>}
              </div>
              
              <div className="space-y-6">
                <div className={`bg-slate-50 p-4 rounded-lg border border-slate-200 ${isFieldChanged('managerNote') || isFieldChanged('managerRating') ? 'border-yellow-400 ring-1 ring-yellow-200' : ''}`}>
                  <InputWrapper label="Ghi chú / Đánh giá của Quản lý">
                    <textarea 
                      className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                      placeholder="Nhập đánh giá chung về tình hình dự án..."
                      value={formData.managerNote}
                      onChange={(e) => handleChange('managerNote', e.target.value)}
                    />
                  </InputWrapper>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="text-sm text-slate-600">Điểm đánh giá:</span>
                     <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} 
                            type="button"
                            onClick={() => handleChange('managerRating', star)}
                            className={`text-2xl ${star <= (formData.managerRating || 0) ? 'text-amber-400' : 'text-slate-300'} transition-colors hover:scale-110`}
                          >
                            ★
                          </button>
                        ))}
                     </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Phân loại lỗi & Sự cố</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Software Errors */}
                    <div className={`flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white ${isFieldChanged('softwareErrors') ? 'border-yellow-400 ring-1 ring-yellow-100' : ''}`}>
                      <div className="flex items-center">
                         <div className="bg-red-100 p-2 rounded-lg mr-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-800">Lỗi phần mềm</p>
                            <p className="text-xs text-slate-500">Bug, crash, sai logic</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button 
                            className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
                            onClick={() => handleChange('softwareErrors', Math.max(0, (formData.softwareErrors || 0) - 1))}
                         > - </button>
                         <input 
                            type="number" 
                            className="w-12 text-center border-b border-slate-300 font-bold" 
                            value={formData.softwareErrors} 
                            readOnly
                         />
                         <button 
                            className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
                            onClick={() => handleChange('softwareErrors', (formData.softwareErrors || 0) + 1)}
                         > + </button>
                      </div>
                    </div>

                    {/* Complaints */}
                    <div className={`flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white ${isFieldChanged('complaints') ? 'border-yellow-400 ring-1 ring-yellow-100' : ''}`}>
                      <div className="flex items-center">
                         <div className="bg-orange-100 p-2 rounded-lg mr-3">
                            <User className="w-5 h-5 text-orange-600" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-800">Phàn nàn KH</p>
                            <p className="text-xs text-slate-500">Feedback tiêu cực</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button 
                            className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
                            onClick={() => handleChange('complaints', Math.max(0, (formData.complaints || 0) - 1))}
                         > - </button>
                         <input 
                            type="number" 
                            className="w-12 text-center border-b border-slate-300 font-bold" 
                            value={formData.complaints} 
                            readOnly
                         />
                         <button 
                            className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
                            onClick={() => handleChange('complaints', (formData.complaints || 0) + 1)}
                         > + </button>
                      </div>
                    </div>

                    {/* Toggles */}
                    <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${isFieldChanged('issueSpec') ? 'border-yellow-400 ring-1 ring-yellow-100' : formData.issueSpec ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-white'}`}>
                       <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mr-3"
                            checked={formData.issueSpec}
                            onChange={(e) => handleChange('issueSpec', e.target.checked)}
                          />
                          <span className="text-sm font-medium text-slate-700">Lỗi Phạm vi Hợp đồng (Scope)</span>
                       </div>
                    </label>

                    <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${isFieldChanged('issueAttitude') ? 'border-yellow-400 ring-1 ring-yellow-100' : formData.issueAttitude ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
                       <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mr-3"
                            checked={formData.issueAttitude}
                            onChange={(e) => handleChange('issueAttitude', e.target.checked)}
                          />
                          <span className="text-sm font-medium text-slate-700">Lỗi Thái độ / Tác phong</span>
                       </div>
                    </label>

                     <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${isFieldChanged('issueClient') ? 'border-yellow-400 ring-1 ring-yellow-100' : formData.issueClient ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-white'}`}>
                       <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mr-3"
                            checked={formData.issueClient}
                            onChange={(e) => handleChange('issueClient', e.target.checked)}
                          />
                          <span className="text-sm font-medium text-slate-700">Lỗi từ phía Khách hàng</span>
                       </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

           {/* STEP 4: SUMMARY */}
           {currentStep === 4 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <Info className="w-5 h-5 mr-2 text-indigo-500" />
                Tổng kết Dự án (Read-Only)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Tổng giá trị</p>
                    <p className="text-xl font-bold text-indigo-600">${summary.signed.toLocaleString()}</p>
                 </div>
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Đã thu (Doanh thu)</p>
                    <p className="text-xl font-bold text-emerald-600">${summary.revenue.toLocaleString()}</p>
                 </div>
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Giá trị còn lại</p>
                    <p className="text-xl font-bold text-slate-600">${summary.remaining.toLocaleString()}</p>
                 </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
                 <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 flex justify-between">
                    <span>Thông tin chính</span>
                    {hasUnsavedChanges && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Có thay đổi chưa lưu</span>}
                 </div>
                 <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                       <span className="text-slate-500 block">Dự án:</span>
                       <span className="font-bold text-slate-900">{formData.name}</span>
                    </div>
                     <div>
                       <span className="text-slate-500 block">Khách hàng:</span>
                       <span className="font-bold text-slate-900">{formData.client}</span>
                    </div>
                     <div>
                       <span className="text-slate-500 block">Sales:</span>
                       <span className="font-medium text-slate-900">{formData.salesRep}</span>
                    </div>
                     <div>
                       <span className="text-slate-500 block">Triển khai:</span>
                       <span className="font-medium text-slate-900">{formData.implRep}</span>
                    </div>
                    <div>
                       <span className="text-slate-500 block">Trạng thái:</span>
                       <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 mt-1">{formData.status}</span>
                    </div>
                    <div>
                       <span className="text-slate-500 block">Tình trạng tiến độ:</span>
                       {summary.daysLate > 0 ? (
                         <span className="text-red-600 font-bold flex items-center mt-1"><AlertTriangle className="w-3 h-3 mr-1"/> Trễ {summary.daysLate} ngày</span>
                       ) : (
                         <span className="text-emerald-600 font-bold flex items-center mt-1"><CheckCircle className="w-3 h-3 mr-1"/> Đúng hạn</span>
                       )}
                    </div>
                 </div>
              </div>

               {summary.totalIssues > 0 && (
                <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                   <h4 className="text-orange-800 font-bold flex items-center mb-2">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Cảnh báo rủi ro
                   </h4>
                   <p className="text-sm text-orange-700">
                      Dự án đang ghi nhận <b>{summary.totalIssues} vấn đề</b> về chất lượng/phạm vi và <b>{formData.complaints} phàn nàn</b> từ khách hàng.
                      Vui lòng kiểm tra kỹ trước khi lưu.
                   </p>
                </div>
               )}

            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            {currentStep > 1 ? (
               <button 
                  onClick={handleBack}
                  className="px-6 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Quay lại
                </button>
            ) : (
               <div></div> // Spacer
            )}

            {currentStep < 4 ? (
               <button 
                  onClick={handleNext}
                  className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center shadow-sm shadow-indigo-200"
                >
                  Tiếp tục <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            ) : (
               <button 
                  onClick={handleSaveClick}
                  className={`px-8 py-2 rounded-lg font-bold text-white transition-colors flex items-center shadow-sm ${isEditMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                >
                  {isEditMode ? <Edit2 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />} 
                  {isEditMode ? 'Cập nhật Dự Án' : 'Lưu Dự Án'}
                </button>
            )}
          </div>

        </div>
      </div>

      {showConfirmation && <ConfirmationModal />}
    </div>
  );
};

export default ProjectForm;