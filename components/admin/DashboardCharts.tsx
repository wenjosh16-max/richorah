"use client"

import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"

const COLORS = {
  primary: "#FF385C",
  green: "#00875A",
  amber: "#F59E0B",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  gray: "#9CA3AF",
}

interface DashboardChartsProps {
  visitesData: { date: string; count: number }[]
  paiementsData: { name: string; value: number; color: string }[]
  revenusData: { week: string; recettes: number; depenses: number }[]
  topBiensData: { nom: string; visites: number }[]
}

export default function DashboardCharts({ visitesData, paiementsData, revenusData, topBiensData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#222]">Visites (30 derniers jours)</h3>
          <span className="text-[10px] text-gray-400">Tendance</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visitesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisites" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                labelStyle={{ fontWeight: 600, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="count" stroke={COLORS.primary} strokeWidth={2} fill="url(#colorVisites)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#222]">Statut des paiements</h3>
          <span className="text-[10px] text-gray-400">Ce mois</span>
        </div>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paiementsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {paiementsData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, fontWeight: 500 }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#222]">Revenus hebdomadaires</h3>
          <span className="text-[10px] text-gray-400">FCFA</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenusData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
              />
              <Bar dataKey="recettes" name="Payé" fill={COLORS.green} radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="depenses" name="En attente" fill={COLORS.amber} radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#222]">Top biens visités</h3>
          <span className="text-[10px] text-gray-400">Visites</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topBiensData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="nom" type="category" tick={{ fontSize: 10, fill: "#4B5563" }} axisLine={false} tickLine={false} width={120} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }}
              />
              <Bar dataKey="visites" name="Visites" fill={COLORS.blue} radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
