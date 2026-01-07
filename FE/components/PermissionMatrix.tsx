import React from 'react';
import { UserRole } from '../types';
import { Check, Minus, Info } from 'lucide-react';

interface PermissionMatrixProps {}

const permissions = [
  { id: 'view_dashboard', name: 'Xem Dashboard', description: 'Truy cập vào trang tổng quan và xem các chỉ số KPI' },
  { id: 'view_project_detail', name: 'Xem Chi tiết Dự án', description: 'Xem toàn bộ thông tin chi tiết của từng dự án' },
  { id: 'create_project', name: 'Tạo Dự án Mới', description: 'Quyền tạo và nhập liệu ban đầu cho dự án' },
  { id: 'edit_project', name: 'Chỉnh sửa Dự án', description: 'Cập nhật thông tin, tiến độ và trạng thái dự án' },
  { id: 'close_project', name: 'Đóng/Hoàn thành Dự án', description: 'Chuyển trạng thái dự án sang Hoàn thành hoặc Hủy' },
  { id: 'view_risk_board', name: 'Xem Bảng Rủi ro', description: 'Truy cập vào Risk Board để phân tích rủi ro' },
  { id: 'view_ai_insight', name: 'Xem AI Insight', description: 'Xem các gợi ý và phân tích từ AI' },
  { id: 'manage_user_role', name: 'Quản lý User & Role', description: 'Thêm sửa xóa người dùng và phân quyền' },
  { id: 'view_audit_log', name: 'Xem Audit Log', description: 'Truy cập lịch sử thay đổi hệ thống' },
];

const roles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER];

// 1 = Allowed, 0 = Denied, -1 = Partial/Conditional (Future use)
const matrix: Record<string, Record<UserRole, number>> = {
  view_dashboard: { [UserRole.ADMIN]: 1, [UserRole.MANAGER]: 1, [UserRole.OPERATOR]: 1, [UserRole.VIEWER]: 1 },
  view_project_detail: { [UserRole.ADMIN]: 1, [UserRole.MANAGER]: 1, [UserRole.OPERATOR]: 1, [UserRole.VIEWER]: 1 },
  create_project: { [UserRole.ADMIN]: 1, [UserRole.MANAGER]: 1, [UserRole.OPERATOR]: 1, [UserRole.VIEWER]: 0 },
  edit_project: { [UserRole.ADMIN]: 1, [UserRole.MANAGER]: 1, [UserRole.OPERATOR]: 1, [UserRole.VIEWER]: 0 },
  close_project: { [UserRole.ADMIN]: 1, [UserRole.MANAGER]: 1, [UserRole.OPERATOR]: 0, [UserRole.VIEWER]: 0 },
  view_risk_board: { [UserRole.ADMIN]: 1, [UserRole.MANAGER]: 1, [UserRole.OPERATOR]: 0, [UserRole.VIEWER]: 0 },
  view_ai_insight: { [UserRole.ADMIN]: 1, [UserRole.MANAGER]: 1, [UserRole.OPERATOR]: 0, [UserRole.VIEWER]: 0 },
  manage_user_role: { [UserRole.ADMIN]: 1, [UserRole.MANAGER]: 0, [UserRole.OPERATOR]: 0, [UserRole.VIEWER]: 0 },
  view_audit_log: { [UserRole.ADMIN]: 1, [UserRole.MANAGER]: 1, [UserRole.OPERATOR]: 0, [UserRole.VIEWER]: 0 },
};

const PermissionMatrix: React.FC<PermissionMatrixProps> = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-slate-800">Phân quyền Hệ thống</h3>
           <p className="text-sm text-slate-500">Quản lý quyền hạn truy cập cho từng nhóm người dùng</p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
             Đặt lại mặc định
           </button>
           <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
             Lưu thay đổi
           </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-medium w-1/3 min-w-[300px]">Chức năng / Quyền hạn</th>
              {roles.map(role => (
                <th key={role} className="p-4 font-medium text-center w-[150px] border-l border-slate-200">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    role === UserRole.ADMIN ? 'bg-slate-800 text-white' :
                    role === UserRole.MANAGER ? 'bg-indigo-100 text-indigo-700' :
                    role === UserRole.OPERATOR ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {role}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {permissions.map((perm) => (
              <tr key={perm.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center group relative cursor-help">
                    <span className="font-medium text-slate-700 mr-2">{perm.name}</span>
                    <Info className="w-4 h-4 text-slate-300" />
                    {/* Tooltip */}
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10">
                      {perm.description}
                    </div>
                  </div>
                </td>
                {roles.map(role => {
                  const hasPerm = matrix[perm.id][role];
                  return (
                    <td key={role} className="p-4 text-center border-l border-slate-100">
                      <div className="flex justify-center">
                        <div 
                          className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer
                            ${hasPerm === 1 ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-300'}
                          `}
                        >
                          {hasPerm === 1 ? <Check className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-4">
         <div className="flex items-center"><div className="w-4 h-4 bg-emerald-500 rounded mr-2 flex items-center justify-center"><Check className="w-3 h-3 text-white"/></div> Cho phép</div>
         <div className="flex items-center"><div className="w-4 h-4 bg-slate-100 rounded mr-2 flex items-center justify-center"><Minus className="w-3 h-3 text-slate-300"/></div> Hạn chế</div>
      </div>
    </div>
  );
};

export default PermissionMatrix;
