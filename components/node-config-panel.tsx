"use client"

import { X, Mail, Phone, Calendar, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WorkflowNode } from "@/lib/types"

interface NodeConfigPanelProps {
  node: WorkflowNode
  updateNodeData: (nodeId: string, data: any) => void
  onClose: () => void
}

export default function NodeConfigPanel({ node, onClose }: NodeConfigPanelProps) {
  const { data } = node

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Profil Employé</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Photo and basic info */}
          <div className="flex flex-col items-center text-center space-y-4">
            {data.photo && (
              <div className="relative">
                <img
                  src={data.photo || "/placeholder.svg"}
                  alt={data.description || "Employee"}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-gray-100"
                />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900">{data.description}</h3>
              <p className="text-sm text-gray-600 mt-1">{data.label}</p>
            </div>
            {data.department && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {data.department}
              </span>
            )}
          </div>

          {/* Contact information */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Informations de Contact</h4>

            {data.email && (
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <a href={`mailto:${data.email}`} className="text-gray-700 hover:text-blue-600 transition-colors">
                  {data.email}
                </a>
              </div>
            )}

            {data.phone && (
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <a href={`tel:${data.phone}`} className="text-gray-700 hover:text-blue-600 transition-colors">
                  {data.phone}
                </a>
              </div>
            )}

            {data.location && (
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{data.location}</span>
              </div>
            )}
          </div>

          {/* Employment details */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Détails de l'Emploi</h4>

            {data.manager && (
              <div className="flex items-center space-x-3 text-sm">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <span className="text-gray-500 text-xs">Manager</span>
                  <p className="text-gray-700">{data.manager}</p>
                </div>
              </div>
            )}

            {data.startDate && (
              <div className="flex items-center space-x-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <span className="text-gray-500 text-xs">Date de début</span>
                  <p className="text-gray-700">{data.startDate}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
