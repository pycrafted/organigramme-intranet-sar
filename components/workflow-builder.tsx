"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type Node,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import NodeConfigPanel from "./node-config-panel"
import CustomEdge from "./custom-edge"
import { InputNode } from "./nodes/input-node"
import { OutputNode } from "./nodes/output-node"
import { ProcessNode } from "./nodes/process-node"
import { ConditionalNode } from "./nodes/conditional-node"
import { CodeNode } from "./nodes/code-node"
import { generateNodeId, createNode } from "@/lib/workflow-utils"
import type { WorkflowNode } from "@/lib/types"

const nodeTypes: NodeTypes = {
  input: InputNode,
  output: OutputNode,
  process: ProcessNode,
  conditional: ConditionalNode,
  code: CodeNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

/**
 * Calcule automatiquement les positions des nœuds dans un organigramme hiérarchique
 * @param hierarchy - Structure hiérarchique: { id, type, data, children }
 * @returns { nodes, edges } - Nœuds et arêtes avec positions calculées
 */
function calculateOrgChartLayout(hierarchy: any): { nodes: Node[]; edges: Edge[] } {
  const CARD_WIDTH = 220 // Largeur de la carte
  const CARD_HEIGHT = 180 // Hauteur approximative de la carte
  const HORIZONTAL_GAP = 100 // Espace horizontal minimum entre les cartes
  const VERTICAL_GAP = 400 // Espace vertical entre les niveaux
  const MIN_SPACING = CARD_WIDTH + HORIZONTAL_GAP // Espacement minimum total

  const nodes: Node[] = []
  const edges: Edge[] = []

  // Fonction récursive pour calculer la largeur totale nécessaire pour un sous-arbre
  function calculateSubtreeWidth(node: any): number {
    if (!node.children || node.children.length === 0) {
      return MIN_SPACING
    }

    // La largeur d'un sous-arbre est la somme des largeurs de ses enfants
    const childrenWidth = node.children.reduce((sum: number, child: any) => {
      return sum + calculateSubtreeWidth(child)
    }, 0)

    return Math.max(MIN_SPACING, childrenWidth)
  }

  // Fonction récursive pour positionner les nœuds
  function positionNodes(node: any, level: number, leftBound: number, rightBound: number, parentId?: string) {
    const subtreeWidth = calculateSubtreeWidth(node)
    const centerX = leftBound + (rightBound - leftBound) / 2
    const y = 50 + level * VERTICAL_GAP

    // Créer le nœud avec sa position calculée
    nodes.push({
      id: node.id,
      type: node.type,
      position: { x: centerX - CARD_WIDTH / 2, y },
      data: node.data,
    })

    // Créer l'arête vers le parent si nécessaire
    if (parentId) {
      edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: "custom",
      })
    }

    // Positionner les enfants
    if (node.children && node.children.length > 0) {
      let currentX = leftBound

      node.children.forEach((child: any) => {
        const childWidth = calculateSubtreeWidth(child)
        positionNodes(child, level + 1, currentX, currentX + childWidth, node.id)
        currentX += childWidth
      })
    }
  }

  // Calculer la largeur totale et commencer le positionnement
  const totalWidth = calculateSubtreeWidth(hierarchy)
  positionNodes(hierarchy, 0, 0, totalWidth)

  return { nodes, edges }
}

const orgChartHierarchy = {
  id: "ceo-1",
  type: "input",
  data: {
    label: "PDG",
    description: "Marie Dubois - Directrice Générale",
    department: "Direction Générale",
    photo: "/professional-woman-ceo.png",
  },
  children: [
    {
      id: "manager-1",
      type: "process",
      data: {
        label: "Directeur IT",
        description: "Jean Martin - Directeur Informatique",
        department: "Direction Informatique",
        photo: "/professional-man-cto-technology.jpg",
      },
      children: [
        {
          id: "employee-1",
          type: "output",
          data: {
            label: "Développeur",
            description: "Thomas Bernard - Développeur Full Stack",
            department: "Direction Informatique",
            photo: "/professional-man-developer-lead.jpg",
          },
        },
        {
          id: "employee-2",
          type: "output",
          data: {
            label: "Développeuse",
            description: "Alice Durand - Développeuse Frontend",
            department: "Direction Informatique",
            photo: "/professional-woman-developer.png",
          },
        },
        {
          id: "employee-3",
          type: "output",
          data: {
            label: "Testeur",
            description: "Paul Girard - Testeur QA",
            department: "Direction Informatique",
            photo: "/professional-man-qa-tester.jpg",
          },
        },
      ],
    },
    {
      id: "manager-2",
      type: "process",
      data: {
        label: "Directrice RH",
        description: "Sophie Laurent - Directrice Ressources Humaines",
        department: "Direction RH",
        photo: "/professional-woman-cfo-finance.jpg",
      },
      children: [
        {
          id: "employee-4",
          type: "output",
          data: {
            label: "Recruteur",
            description: "Emma Petit - Responsable Recrutement",
            department: "Direction RH",
            photo: "/professional-woman-qa-lead.jpg",
          },
        },
        {
          id: "employee-5",
          type: "output",
          data: {
            label: "Gestionnaire RH",
            description: "Lucas Moreau - Gestionnaire Paie",
            department: "Direction RH",
            photo: "/professional-accountant.png",
          },
        },
        {
          id: "employee-6",
          type: "output",
          data: {
            label: "Formatrice",
            description: "Julie Simon - Responsable Formation",
            department: "Direction RH",
            photo: "/professional-woman-digital-marketing.jpg",
          },
        },
      ],
    },
  ],
}

const { nodes: initialNodes, edges: initialEdges } = calculateOrgChartLayout(orgChartHierarchy)

export default function WorkflowBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, type: "custom" }, eds)),
    [setEdges],
  )

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const type = event.dataTransfer.getData("application/reactflow")

      // Check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return
      }

      if (reactFlowBounds && reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        })

        const newNode = createNode({
          type,
          position,
          id: generateNodeId(type),
        })

        setNodes((nds) => nds.concat(newNode))
      }
    },
    [reactFlowInstance, setNodes],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const updateNodeData = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="flex-1 flex flex-col">
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              snapToGrid
              snapGrid={[15, 15]}
              defaultEdgeOptions={{ type: "custom" }}
              minZoom={0.1}
              maxZoom={2}
            >
              <Background />
              <Controls position="top-right" />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {selectedNode && (
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 p-4 bg-gray-50 max-h-[40vh] lg:max-h-none overflow-y-auto">
          <NodeConfigPanel
            node={selectedNode as WorkflowNode}
            updateNodeData={updateNodeData}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      )}
    </div>
  )
}
