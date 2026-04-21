"use client";

import React, { useEffect, useState } from 'react';
import { CreditCard, ArrowUpRight, Wallet, History, Info } from "lucide-react";
import { getBillingData } from '@/src/actions/billingsActions';
import { Plus } from 'lucide-react'

export default function FreelancerEarningsPage() {
  const [data, setData] = useState<any>({ balance: 0, transactions: [], pendingAmount: 0 });

  useEffect(() => {
    getBillingData("freelancer_id_here").then(setData);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thu nhập có thể rút */}
        <div className="p-8 bg-indigo-700 rounded-4xl text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <Wallet className="mb-4 opacity-70" size={32} />
            <p className="text-indigo-100 text-sm font-medium">Số dư khả dụng</p>
            <h3 className="text-4xl font-black mt-1">${data.balance.toLocaleString()}</h3>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Tiền đang chờ xử lý (Escrow) */}
        <div className="p-8 bg-white border border-slate-200 rounded-4xl shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <ArrowUpRight size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Đang đợi thanh toán</p>
          <h3 className="text-3xl font-bold text-slate-800">${data.pendingAmount.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Info size={12} /> Tiền sẽ giải ngân sau khi client duyệt job
          </p>
        </div>

        {/* Stripe Payout */}
        <div className="p-8 bg-white border border-slate-200 rounded-4xl shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-4">Phương thức rút tiền</p>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center text-[8px] text-white font-bold">STRIPE</div>
              <span className="text-sm font-semibold text-slate-700">**** 4242</span>
            </div>
          </div>
          <button className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200">
            Rút về Ngân hàng
          </button>
        </div>
      </div>

      {/* Lịch sử thu nhập rút gọn */}
      <div className="bg-white rounded-4xl border border-slate-200 p-8">
        <div className="flex items-center gap-2 mb-6">
          <History className="text-slate-400" size={20} />
          <h3 className="font-bold text-slate-800 text-lg">Lịch sử thu nhập</h3>
        </div>
        <div className="space-y-4">
          {data.transactions.filter((t: any) => t.amount > 0).map((tx: any) => (
            <div key={tx.id} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <Plus size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{tx.description}</p>
                  <p className="text-xs text-slate-400">{new Date(tx.createdAt).toDateString()}</p>
                </div>
              </div>
              <span className="font-bold text-green-600">+${tx.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}