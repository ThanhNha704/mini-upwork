"use client";

import React, { useState } from 'react';
import { 
  Wallet, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('transactions');

  // Dữ liệu mẫu (Giả lập từ Database)
  const balance = 1250.50;
  const transactions = [
    { id: 'TX-9012', type: 'payment', amount: -450, status: 'Completed', date: '2024-03-20', label: 'Thanh toán Dự án Website' },
    { id: 'TX-9013', type: 'deposit', amount: 1000, status: 'Completed', date: '2024-03-18', label: 'Nạp tiền vào ví' },
    { id: 'TX-9014', type: 'payment', amount: -200, status: 'Pending', date: '2024-03-15', label: 'Thanh toán Thiết kế Logo' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header & Tổng quan */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thẻ Ví tiền */}
        <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-blue-100 text-sm font-medium">Số dư hiện tại</p>
              <h1 className="text-3xl font-bold mt-1">${balance.toLocaleString()}</h1>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Wallet size={24} />
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
            <Plus size={20} />
            Nạp thêm tiền
          </button>
        </div>

        {/* Thẻ Thống kê nhanh */}
        <div className="flex-[1.5] grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <p className="text-gray-500 text-sm">Hợp đồng đang chạy</p>
            <div className="flex items-end justify-between mt-4">
              <h3 className="text-2xl font-bold">04</h3>
              <FileText className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <p className="text-gray-500 text-sm">Tổng chi tiêu tháng này</p>
            <div className="flex items-end justify-between mt-4">
              <h3 className="text-2xl font-bold text-red-500">$840.00</h3>
              <ArrowUpRight className="text-red-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'transactions' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Lịch sử giao dịch
            {activeTab === 'transactions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
          </button>
          <button 
            onClick={() => setActiveTab('contracts')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'contracts' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Hợp đồng & Hóa đơn
            {activeTab === 'contracts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-wrap gap-4 justify-between items-center">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm theo mã GD..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter size={16} /> Lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Giao dịch</th>
                <th className="px-6 py-4">Ngày</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {tx.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tx.label}</p>
                        <p className="text-xs text-gray-500">{tx.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                  <td className={`px-6 py-4 font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}$
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tx.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {tx.status === 'Completed' ? 'Thành công' : 'Chờ xử lý'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:underline font-medium">Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}