import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  MeasuringStrategy,
  PointerSensor,
  UniqueIdentifier,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { createContext, useCallback, useMemo, useState } from "react"
import { FlattenedItem, TreeItem } from "../SortableTree/types"
import { indentionWidth } from "../SortableTree/constants"
import {
  buildTree,
  flatten,
  getChildrenIds,
  getProjection,
} from "../SortableTree/utilities"

type ContextDescriptor = {
  flattenedItems: FlattenedItem[]
  activeId: UniqueIdentifier | null
  activeItem: FlattenedItem | null
  overId: UniqueIdentifier | null
  offsetLeft: number
  projectedDepth: number
  expandedIds: UniqueIdentifier[]
  indentionWidth: number
  handleToggleExpand: (id: UniqueIdentifier) => void
}

export const Context = createContext<ContextDescriptor | null>(null)

// https://docs.dndkit.com/api-documentation/context-provider#layout-measuring
const measuring = {
  droppable: {
    DndContext,
    strategy: MeasuringStrategy.Always,
  },
}

export const SortableTreeContext = ({
  treeItems,
  children,
}: {
  treeItems: TreeItem[]
  children: (
    flattenedItems: FlattenedItem[],
    activeItem: FlattenedItem | null,
  ) => React.ReactNode
}) => {
  const [items, setItems] = useState<TreeItem[]>(treeItems)

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null)
  // ドラッグ中のオフセットを保持する。どの階層に追加するかを判定するために使用する。
  const [offsetLeft, setOffsetLeft] = useState(0)

  const resetState = useCallback(() => {
    setActiveId(null)
    setOverId(null)
    setOffsetLeft(0)
  }, [])

  const [expandedIds, setExpandedIds] = useState<UniqueIdentifier[]>([])

  // ツリーをフラット化する。
  const flattenedItems = useMemo(() => {
    const flattenedTree = flatten(items)

    // 1階層目のアイテムと親アイテムがexpandedIdsに含まれるアイテムのみを表示する。
    return flattenedTree.filter(
      (item) => item.parentId === null || expandedIds.includes(item.parentId),
    )
  }, [expandedIds, items])

  const sortedIds = useMemo(
    () => flattenedItems.map((item) => item.id),
    [flattenedItems],
  )

  // expandedにない場合は追加、含まれている場合は小アイテムのidも削除する。
  const handleToggleExpand = useCallback(
    (id: UniqueIdentifier) => {
      setExpandedIds((expandedIds) => {
        if (expandedIds.includes(id)) {
          const childrenIds = getChildrenIds(items, id)
          return expandedIds.filter(
            (expandedId) =>
              expandedId !== id && !childrenIds.includes(expandedId),
          )
        } else {
          return [...new Set([...expandedIds, id])]
        }
      })
    },
    [items],
  )

  const activeItem = useMemo(
    () => flattenedItems.find(({ id }) => id === activeId) ?? null,
    [activeId, flattenedItems],
  )

  const projected = useMemo(
    () =>
      activeId && overId
        ? getProjection(
            flattenedItems,
            activeId,
            overId,
            offsetLeft,
            indentionWidth,
          )
        : null,
    [activeId, flattenedItems, offsetLeft, overId],
  )

  const handleDragStart = useCallback(
    ({ active: { id: activeId } }: DragStartEvent) => {
      setActiveId(activeId)
      setOverId(activeId)

      const childrenIds = getChildrenIds(flattenedItems, activeId)
      // ドラッグ中のアイテムとその子アイテムを閉じる
      setExpandedIds((expandedIds) =>
        expandedIds.filter(
          (expandedId) =>
            expandedId !== activeId && !childrenIds.includes(expandedId),
        ),
      )
    },
    [flattenedItems],
  )
  const handleDragMove = useCallback(({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x)
  }, [])

  const handleDragOver = useCallback(({ over }: DragOverEvent) => {
    setOverId(over?.id ?? null)
  }, [])

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      resetState()

      if (projected && over) {
        const { parentId, depth } = projected
        const clonedItems: FlattenedItem[] = flatten(items)

        const overIndex = clonedItems.findIndex((item) => item.id === over.id)
        const activeIndex = clonedItems.findIndex(
          (item) => item.id === active.id,
        )
        const activeTreeItem = clonedItems[activeIndex]
        clonedItems[activeIndex] = {
          ...activeTreeItem,
          parentId: parentId,
          depth: depth,
        }

        const sortedItems = arrayMove(clonedItems, activeIndex, overIndex)
        const newItems = buildTree(sortedItems)

        setItems(newItems)
        // expandedIdsに親アイテムが含まれていない場合は追加する
        if (parentId) {
          setExpandedIds((expandedIds) =>
            expandedIds.includes(parentId)
              ? expandedIds
              : [...expandedIds, parentId],
          )
        }
      }
    },
    [items, projected, resetState],
  )
  const handleDragCancel = useCallback(() => {
    resetState()
  }, [resetState])

  // https://docs.dndkit.com/api-documentation/context-provider#sensors
  const sensors = useSensors(useSensor(PointerSensor))

  return (
    <Context.Provider
      value={{
        flattenedItems,
        activeId,
        activeItem,
        overId,
        projectedDepth: projected?.depth ?? 0,
        offsetLeft,
        expandedIds,
        indentionWidth,
        handleToggleExpand,
      }}
    >
      <DndContext
        sensors={sensors}
        // https://docs.dndkit.com/api-documentation/context-provider#collision-detection
        collisionDetection={closestCenter}
        measuring={measuring}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={sortedIds}
          strategy={verticalListSortingStrategy}
        >
          {children(flattenedItems, activeItem)}
        </SortableContext>
      </DndContext>
    </Context.Provider>
  )
}
