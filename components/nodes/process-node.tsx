"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import type { NodeData } from "@/lib/types"

export const ProcessNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-w-[180px] sm:min-w-[220px]">
      {data.photo && (
        <div className="flex justify-center pt-4 sm:pt-6 pb-3 sm:pb-4">
          <img
            src={data.photo || "/placeholder.svg"}
            alt={data.label}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-gray-100"
          />
        </div>
      )}

      <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-center">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{data.label || "Process"}</h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{data.description || "Data processing node"}</p>

        {data.department && (
          <div className="mt-2 sm:mt-3 inline-block text-[10px] sm:text-xs bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium">
            {data.department}
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />
    </div>
  )
})

ProcessNode.displayName = "ProcessNode"
