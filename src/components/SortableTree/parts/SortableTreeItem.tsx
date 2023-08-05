import { CSS } from "@dnd-kit/utilities"
import { AnimateLayoutChanges, useSortable } from "@dnd-kit/sortable"
import { CSSProperties, FC } from "react"
import { FlattenedItem } from "../types"
import { RxDragHandleDots2 } from "react-icons/rx"
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri"
type SortableTreeItemProps = {
  item: FlattenedItem
  depth: number
  onExpand?: () => void
  expanded?: boolean
  indentionWidth: number
  clone?: boolean
  childrenCount?: number
}

// ドラッグ中はアニメーションを無効にする
const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true)

// Containerコンポーネント
export const SortableTreeItem: FC<SortableTreeItemProps> = ({
  item,
  depth,
  onExpand,
  expanded,
  indentionWidth,
  clone,
  childrenCount,
}) => {
  const {
    isDragging,
    setDroppableNodeRef,
    setDraggableNodeRef,
    transform,
    transition,
    attributes,
    listeners,
  } = useSortable({
    id: item.id,
    animateLayoutChanges,
  })
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <li
      ref={setDroppableNodeRef}
      className={`w-full list-none py-1 ${clone && "absolute left-4 top-4"}`}
      style={{
        // ここでpaddingLeftを指定することで、子要素が親要素より右にずれる
        paddingLeft: clone ? 0 : depth * indentionWidth,
      }}
    >
      <div
        ref={setDraggableNodeRef}
        className={`flex items-center gap-4 bg-blue-400 p-2 ${
          isDragging ? "opacity-50" : "opacity-100"
        }`}
        style={style}
      >
        {clone ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-50 text-xs font-bold text-blue-400">
            {childrenCount}
          </span>
        ) : (
          <button {...attributes} {...listeners}>
            <RxDragHandleDots2 />
          </button>
        )}
        <div className="flex gap-2">
          {onExpand && (
            <button onClick={onExpand}>
              {expanded ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
            </button>
          )}
          {item.name}
        </div>
      </div>
    </li>
  )
}
