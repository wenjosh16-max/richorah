"use client"

import { useState } from "react"
import { SlidersHorizontal, Calculator } from "lucide-react"
import { formatPrix } from "@/lib/utils"

interface SimulateurCreditProps {
  prix: number
}

export default function SimulateurCredit({ prix }: SimulateurCreditProps) {
  const [apport, setApport] = useState(20)
  const [duree, setDuree] = useState(10)
  const [taux, setTaux] = useState(8)

  const montantEmprunte = prix * (1 - apport / 100)
  const tauxMensuel = taux / 100 / 12
  const nbMois = duree * 12
  const mensualite =
    tauxMensuel > 0
      ? (montantEmprunte * tauxMensuel * Math.pow(1 + tauxMensuel, nbMois)) /
        (Math.pow(1 + tauxMensuel, nbMois) - 1)
      : montantEmprunte / nbMois

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#FF385C]/10 rounded-lg flex items-center justify-center">
          <Calculator className="h-5 w-5 text-[#FF385C]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#1A1A2E]">Simulateur de crédit</h3>
          <p className="text-xs text-gray-500">Estimation mensuelle</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600 flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Apport
            </label>
            <span className="text-sm font-semibold text-[#1A1A2E]">{apport}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={apport}
            onChange={(e) => setApport(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF385C]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatPrix(0)}</span>
            <span>{formatPrix(prix * 0.5)}</span>
            <span>{formatPrix(prix)}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600 flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Durée
            </label>
            <span className="text-sm font-semibold text-[#1A1A2E]">{duree} ans</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={duree}
            onChange={(e) => setDuree(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF385C]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 an</span>
            <span>10 ans</span>
            <span>20 ans</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600 flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Taux d&rsquo;intérêt
            </label>
            <span className="text-sm font-semibold text-[#1A1A2E]">{taux}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={15}
            step={0.5}
            value={taux}
            onChange={(e) => setTaux(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF385C]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5%</span>
            <span>10%</span>
            <span>15%</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#F8F7F4] rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Montant emprunté</p>
            <p className="text-sm font-semibold text-[#1A1A2E]">
              {formatPrix(Math.round(montantEmprunte))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Apport personnel</p>
            <p className="text-sm font-semibold text-[#1A1A2E]">
              {formatPrix(Math.round(prix * (apport / 100)))}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-3 pt-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Mensualité estimée</p>
            <p className="text-xl font-bold text-[#FF385C]">
              {mensualite > 0 && isFinite(mensualite)
                ? formatPrix(Math.round(mensualite))
                : formatPrix(0)}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Sur {duree} an{duree > 1 ? "s" : ""} au taux de {taux}%
          </p>
        </div>
      </div>
    </div>
  )
}
