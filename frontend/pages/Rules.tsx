
import React from 'react';
import { ScrollText, CheckCircle } from 'lucide-react';

export const Rules: React.FC = () => {
  return (
    <div className="animate-fade-in pb-10 max-w-4xl mx-auto">
      <div className="text-center mb-10">
         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <ScrollText className="h-8 w-8" />
         </div>
         <h2 className="text-3xl font-bold text-gray-900">Nội Quy Nhà Trường</h2>
         <p className="text-gray-500 mt-2">Quy định chung dành cho toàn thể học sinh trường THCS Phước Tân</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="bg-indigo-600 px-6 py-4">
            <h3 className="text-white font-bold text-lg uppercase tracking-wide">Điều Lệ Chung</h3>
         </div>
         <div className="p-8 space-y-6">
            <section>
               <h4 className="font-bold text-gray-900 text-lg mb-3 flex items-center"><span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs mr-2">1</span> Thời gian & Chuyên cần</h4>
               <ul className="space-y-2 pl-8">
                  <li className="flex items-start text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" /> Đi học đúng giờ, có mặt tại trường trước 6:45 (Sáng) hoặc 12:45 (Chiều).</li>
                  <li className="flex items-start text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" /> Nghỉ học phải có đơn xin phép của phụ huynh.</li>
               </ul>
            </section>

            <section>
               <h4 className="font-bold text-gray-900 text-lg mb-3 flex items-center"><span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs mr-2">2</span> Trang phục & Tác phong</h4>
               <ul className="space-y-2 pl-8">
                  <li className="flex items-start text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" /> Mặc đồng phục đúng quy định vào các ngày trong tuần.</li>
                  <li className="flex items-start text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" /> Đeo khăn quàng đỏ (đối với Đội viên).</li>
                  <li className="flex items-start text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" /> Đầu tóc gọn gàng, không nhuộm tóc màu sáng.</li>
               </ul>
            </section>

            <section>
               <h4 className="font-bold text-gray-900 text-lg mb-3 flex items-center"><span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs mr-2">3</span> Ứng xử & Học tập</h4>
               <ul className="space-y-2 pl-8">
                  <li className="flex items-start text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" /> Lễ phép với thầy cô, hòa nhã với bạn bè.</li>
                  <li className="flex items-start text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" /> Giữ gìn vệ sinh chung, bảo vệ tài sản nhà trường.</li>
                  <li className="flex items-start text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" /> Trung thực trong thi cử và kiểm tra.</li>
               </ul>
            </section>
         </div>
         <div className="bg-gray-50 px-6 py-4 text-center text-gray-500 text-sm italic border-t border-gray-100">
            "Tiên học lễ - Hậu học văn"
         </div>
      </div>
    </div>
  );
};
