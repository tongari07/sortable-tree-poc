import { CSS } from "@dnd-kit/utilities"
import {
  DndContext,
  DragOverlay,
  DropAnimation,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  defaultDropAnimation,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableTreeItem } from "./parts/SortableTreeItem"
import { createPortal } from "react-dom"
import { useSortableTree } from "./hooks/useSortableTree"
import { getChildrenIds } from "./utilities"
import { TreeItem } from "./types"
import { FC } from "react"

const indentionWidth = 20

// https://docs.dndkit.com/api-documentation/context-provider#layout-measuring
const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
}

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ]
  },
  easing: "ease-out",
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    })
  },
}

type SortableTreeProps = {
  defaultItems: TreeItem[]
}

export const SortableTree: FC<SortableTreeProps> = ({ defaultItems }) => {
  const {
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
  } = useSortableTree(defaultItems, indentionWidth)

  // https://docs.dndkit.com/api-documentation/context-provider#sensors
  const sensors = useSensors(useSensor(PointerSensor))

  return (
    <div className="flex w-full flex-col gap-16">
      <div className="w-full">
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
            {flattenedItems.map((item) => {
              return (
                <SortableTreeItem
                  key={item.id}
                  item={item}
                  depth={
                    item.id === activeId && projected
                      ? projected.depth
                      : item.depth
                  }
                  onExpand={
                    item.children.length > 0
                      ? () => handleToggleExpand(item.id)
                      : undefined
                  }
                  expanded={
                    item.children.length > 0 && expandedIds.includes(item.id)
                  }
                  indentionWidth={indentionWidth}
                />
              )
            })}
            {/* ドラッグ中に要素がどこに落ちるかを表示するため */}
            {createPortal(
              <DragOverlay dropAnimation={dropAnimationConfig}>
                {activeId && activeItem && (
                  <SortableTreeItem
                    item={activeItem}
                    depth={activeItem.depth}
                    indentionWidth={indentionWidth}
                    clone
                    childrenCount={getChildrenIds(items, activeId).length}
                  />
                )}
              </DragOverlay>,
              document.body,
            )}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
