// src/app/(dashboard)/freelancer/earnings/page.tsx
import { CreditCard, ArrowUpRight, Wallet } from "lucide-react";

export default function EarningsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tổng thu nhập */}
        <div className="p-6 bg-linear-to-br from-violet-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-violet-200">
          <Wallet className="mb-4 opacity-80" size={32} />
          <p className="opacity-80 text-sm font-medium">Tổng thu nhập</p>
          <h3 className="text-3xl font-bold">$2,450.00</h3>
        </div>

        {/* Tiền đang chờ xử lý */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <ArrowUpRight size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Đang chờ xử lý (Escrow)</p>
          <h3 className="text-3xl font-bold text-slate-800">$800.00</h3>
        </div>

        {/* Nút rút tiền qua Stripe */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between">
          <p className="text-slate-500 text-sm font-medium">Phương thức thanh toán</p>
          <div className="flex items-center gap-2 text-blue-600 font-bold">
            <CreditCard /> Stripe Connected
          </div>
          <button className="mt-4 w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
            Rút tiền về ngân hàng
          </button>
        </div>
      </div>
    </div>
  );
}