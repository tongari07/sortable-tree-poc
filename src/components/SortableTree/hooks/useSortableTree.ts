import { UniqueIdentifier } from "@dnd-kit/core"
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable"
import { useCallback, useContext, useMemo } from "react"
import { Context } from "../../SortableTreeContext/SortableTreeContext"
import { getChildrenIds } from "../utilities"

// ドラッグ中はアニメーションを無効にする
const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true)

export const useSortableTree = (id: UniqueIdentifier) => {
  const sortableContextProps = useSortable({
    id: id,
    animateLayoutChanges,
  })

  const sortableTreeContextProps = useContext(Context)

  if (sortableTreeContextProps === null) {
    throw new Error(
      "useSortableTreeContext must be used within a SortableTreeContextProvider",
    )
  }

  const {
    flattenedItems,
    handleToggleExpand,
    expandedIds,
    activeId,
    projectedDepth,
    ...rest
  } = sortableTreeContextProps

  const depth = useMemo(
    () =>
      id === activeId
        ? projectedDepth
        : flattenedItems.find((item) => item.id === id)?.depth ?? 0,
    [activeId, flattenedItems, id, projectedDepth],
  )
  const onExpand = useCallback(
    () => handleToggleExpand(id),
    [handleToggleExpand, id],
  )

  const isExpanded = useMemo(() => expandedIds.includes(id), [expandedIds, id])

  const childrenCount = useMemo(
    () => getChildrenIds(flattenedItems, id).length,
    [id, flattenedItems],
  )

  return {
    ...sortableContextProps,
    depth,
    onExpand,
    isExpanded,
    childrenCount,
    ...rest,
  }
}
