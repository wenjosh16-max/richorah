"use client"

import { useState, useEffect } from "react"
import LocationInput from "./LocationInput"

interface FilterLocationFieldProps {
  defaultValue?: string
}

export default function FilterLocationField({ defaultValue }: FilterLocationFieldProps) {
  const [value, setValue] = useState(defaultValue || "")

  useEffect(() => {
    setValue(defaultValue || "")
  }, [defaultValue])

  useEffect(() => {
    if (defaultValue && value === defaultValue) {
      const check = async () => {
        try {
          await fetch("/api/lieux/signaler", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ville: defaultValue }),
          })
        } catch {
          // silencieux
        }
      }
      check()
    }
  }, [defaultValue])

  return (
    <LocationInput
      value={value}
      onChange={setValue}
      placeholder="Rechercher une ville..."
      name="ville"
      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
    />
  )
}
