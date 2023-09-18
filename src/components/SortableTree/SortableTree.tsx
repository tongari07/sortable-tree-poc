import { CSS } from "@dnd-kit/utilities"
import { DragOverlay, DropAnimation, defaultDropAnimation } from "@dnd-kit/core"
import { SortableTreeItem } from "../SotrableTreeItem/SortableTreeItem"
import { createPortal } from "react-dom"
import { TreeItem } from "./types"
import { FC } from "react"
import { SortableTreeContext } from "../SortableTreeContext/SortableTreeContext"

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
  return (
    <SortableTreeContext treeItems={defaultItems}>
      {(flattenedItems, activeItem) => (
        <div className="flex w-full flex-col gap-16">
          <div className="w-full">
            {flattenedItems.map((item) => {
              return <SortableTreeItem key={item.id} item={item} />
            })}
            {/* ドラッグ中に要素がどこに落ちるかを表示するため */}
            {createPortal(
              <DragOverlay dropAnimation={dropAnimationConfig}>
                {activeItem && <SortableTreeItem item={activeItem} isClone />}
              </DragOverlay>,
              document.body,
            )}
          </div>
        </div>
      )}
    </SortableTreeContext>
  )
}
