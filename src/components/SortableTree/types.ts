import { UniqueIdentifier } from "@dnd-kit/core"

export type TreeItem = {
  id: UniqueIdentifier
  name?: string
  children: TreeItem[]
}

export type FlattenedItem = TreeItem & {
  parentId: UniqueIdentifier | null
  depth: number
}
