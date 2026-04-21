"use client";

import React, { useEffect, useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Search, Clock, CreditCard, Loader2 } from 'lucide-react';
import { getBillingData, createDeposit } from '@/src/actions/billingsActions';
import { createClient } from "@/src/utils/supabase/client";

export default function ClientBillingPage() {
  const [data, setData] = useState<any>({ balance: 0, transactions: [], pendingAmount: 0 });
  const [userId, setUserId] = useState<string | null>(null); // Khai báo state cho userId
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    const initData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id); // Lưu ID thật vào state
          const billingData = await getBillingData(user.id);
          setData(billingData);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initData();
  }, []);

  // Hiển thị trạng thái chờ để tránh lỗi "userId is not defined" khi chưa load xong
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card Số dư & Nạp tiền */}
        <div className="md:col-span-1 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-blue-100 text-sm font-medium opacity-80">Số dư hiện tại</p>
              <h1 className="text-4xl font-bold mt-2">
                ${data.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h1>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl">
              <Wallet size={28} />
            </div>
          </div>
          
          <form action={createDeposit} className="space-y-3">
            {/* Sử dụng biến userId từ state */}
            <input type="hidden" name="userId" value={userId || ''} />
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold">$</span>
              <input 
                name="amount"
                type="number" 
                placeholder="Nhập số tiền..." 
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/10 text-white font-bold outline-none border border-white/20 placeholder:text-white/60 focus:ring-1 focus:ring-white"
                min="1"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-white text-violet-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-violet-50 transition-all active:scale-95 shadow-lg"
            >
              <Plus size={20} /> Nạp tiền ngay
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4">
              <Clock size={20} />
            </div>
            <p className="text-slate-500 text-sm">Tiền đang giữ (Escrow)</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">${data.pendingAmount.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-4">
              <ArrowUpRight size={20} />
            </div>
            <p className="text-slate-500 text-sm">Tổng chi tiêu</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">$0.00</h3>
          </div>
        </div>

        {/* Phương thức thanh toán nhanh */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-slate-500 text-sm font-medium">Cổng thanh toán</p>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <CreditCard className="text-blue-600" />
                <span className="font-bold text-slate-700 text-sm">Stripe Secure</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                Giao dịch được bảo mật bởi mã hóa SSL 256-bit. Tiền sẽ được cộng vào tài khoản sau khi Stripe xác nhận.
            </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4">
          <h3 className="font-bold text-slate-800 text-lg">Lịch sử giao dịch</h3>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Tìm giao dịch..." className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 ring-violet-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-8 py-4">Chi tiết</th>
                <th className="px-8 py-4">Ngày thực hiện</th>
                <th className="px-8 py-4">Số tiền</th>
                <th className="px-8 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.transactions.length > 0 ? (
                data.transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {tx.type === 'deposit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{tx.description}</p>
                          <p className="text-[11px] text-slate-400 uppercase tracking-tighter">ID: {tx.id.slice(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className={`px-8 py-5 font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}$
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {tx.status === 'completed' ? 'Thành công' : 'Chờ xử lý'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-slate-400">
                    Chưa có giao dịch nào phát sinh
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}