import { CSS } from "@dnd-kit/utilities"
import { CSSProperties, FC, memo } from "react"
import { FlattenedItem } from "../SortableTree/types"
import { RxDragHandleDots2 } from "react-icons/rx"
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri"
import { useSortableTree } from "../SortableTree/hooks/useSortableTree"

type SortableTreeItemProps = {
  item: FlattenedItem
  isClone?: boolean
}

// Containerコンポーネント
export const SortableTreeItem: FC<SortableTreeItemProps> = memo(
  ({ item, isClone }) => {
    const {
      isDragging,
      setDroppableNodeRef,
      setDraggableNodeRef,
      transform,
      transition,
      attributes,
      listeners,
      onExpand,
      depth,
      indentionWidth,
      isExpanded,
      childrenCount,
    } = useSortableTree(item.id)

    const style: CSSProperties = {
      transform: CSS.Translate.toString(transform),
      transition,
    }

    return (
      <li
        ref={setDroppableNodeRef}
        className={`w-full list-none py-1 ${
          isClone && "absolute left-4 top-4"
        }`}
        style={{
          // ここでpaddingLeftを指定することで、子要素が親要素より右にずれる
          paddingLeft: isClone ? 0 : depth * indentionWidth,
        }}
      >
        <div
          ref={setDraggableNodeRef}
          className={`flex items-center gap-4 bg-blue-400 p-2 ${
            isDragging ? "opacity-50" : "opacity-100"
          }`}
          style={style}
        >
          {isClone ? (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-50 text-xs font-bold text-blue-400">
              {childrenCount}
            </span>
          ) : (
            <button {...attributes} {...listeners}>
              <RxDragHandleDots2 />
            </button>
          )}
          <div className="flex gap-2">
            {childrenCount > 0 && onExpand && (
              <button onClick={onExpand}>
                {isExpanded ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
              </button>
            )}
            {item.name}
          </div>
        </div>
      </li>
    )
  },
)
