'use client';

import React, { useEffect, useState } from 'react';
import { Users, Box, MoreVertical, TrendingUp, TrendingDown, DollarSign, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

interface DashboardData {
  customersCount: number;
  propertiesCount: number;
  propertyStatus: Record<string, number>;
  marketRole: {
    totalSellers: number;
    totalBuyers: number;
  };
  earnings: {
    advanceReceived: number;
    received: number;
    pendingPayments: number;
  };
  monthlySales: Record<string, number>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const salesValues = data?.monthlySales ? months.map((m) => data.monthlySales[m] || 0) : Array(12).fill(0);
  const maxSales = Math.max(...salesValues, 400);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Row Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Customers & Properties Cards + Status Breakdown */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Customers Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-right text-xs text-gray-400">
                  <span>Buyers: <b>{data?.marketRole?.totalBuyers || 0}</b></span> | <span>Sellers: <b>{data?.marketRole?.totalSellers || 0}</b></span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <div className="flex items-baseline justify-between mt-1">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {data?.customersCount?.toLocaleString() || '0'}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
              </div>
            </div>

            {/* Properties / Orders Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Box className="w-6 h-6" />
                </div>
                <div className="text-xs text-gray-400 space-x-2">
                  {Object.entries(data?.propertyStatus || {}).map(([st, count]) => (
                    <span key={st} className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      {st}: <b>{count}</b>
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Total Properties</p>
                <div className="flex items-baseline justify-between mt-1">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {data?.propertiesCount?.toLocaleString() || '0'}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
                    Listed
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Monthly Earnings Card (Replaced Monthly Target) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Monthly Earnings</h3>
                  <p className="text-xs text-gray-400">Advance, Received & Pending overview</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              {/* Earnings Breakdown List */}
              <div className="space-y-3 my-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ShieldCheck className="w-4 h-4" /></div>
                    <span className="text-sm font-medium text-gray-600">Advance Received</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${data?.earnings?.advanceReceived?.toLocaleString() || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
                    <span className="text-sm font-medium text-gray-600">Received (Paid)</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">${data?.earnings?.received?.toLocaleString() || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Clock className="w-4 h-4" /></div>
                    <span className="text-sm font-medium text-gray-600">Pending Payments</span>
                  </div>
                  <span className="text-sm font-bold text-amber-600">${data?.earnings?.pendingPayments?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="pt-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">Calculated automatically from real estate deals & inventory.</p>
            </div>

          </div>

        </div>

        {/* Bottom Row: Monthly Sales Bar Chart Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Monthly Sales Volume</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Bar Chart Container */}
          <div className="relative h-64 flex items-end justify-between pt-6 px-2">
            <div className="absolute inset-x-0 top-0 flex flex-col justify-between h-52 pointer-events-none text-xs text-gray-300">
              <div className="border-b border-gray-100 w-full flex justify-between"><span>400+</span></div>
              <div className="border-b border-gray-100 w-full flex justify-between"><span>300</span></div>
              <div className="border-b border-gray-100 w-full flex justify-between"><span>200</span></div>
              <div className="border-b border-gray-100 w-full flex justify-between"><span>100</span></div>
              <div className="border-b border-gray-100 w-full flex justify-between"><span>0</span></div>
            </div>

            {months.map((month, index) => {
              const val = salesValues[index];
              const heightPercentage = Math.min(Math.max((val / maxSales) * 100, 5), 100);

              return (
                <div key={month} className="relative z-10 flex flex-col items-center flex-1 group">
                  <div
                    className="w-4 sm:w-6 bg-indigo-600 rounded-t-md transition-all duration-300 group-hover:bg-indigo-700"
                    style={{ height: `${heightPercentage}%` }}
                    title={`${month}: $${val}`}
                  ></div>
                  <span className="mt-3 text-xs font-medium text-gray-500">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}