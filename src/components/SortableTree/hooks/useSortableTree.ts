import {
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core"
import { useCallback, useMemo, useState } from "react"
import { FlattenedItem, TreeItem } from "../types"
import { arrayMove } from "@dnd-kit/sortable"
import { buildTree, flatten, getChildrenIds, getProjection } from "../utilities"

export const useSortableTree = (
  defaultItems: TreeItem[],
  indentionWidth: number,
) => {
  const [items, setItems] = useState<TreeItem[]>(defaultItems)

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
    () => (activeId ? flattenedItems.find(({ id }) => id === activeId) : null),
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
    [activeId, flattenedItems, indentionWidth, offsetLeft, overId],
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

  return {
    items,
    flattenedItems,
    sortedIds,
    activeId,
    activeItem,
    expandedIds,
    projected,
    handleToggleExpand,
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }
}
