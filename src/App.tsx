import { SortableTree } from "./components/SortableTree"
import { sampleTreeItems } from "./components/SortableTree/mock/data"

function App() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-24">
      <h1 className="text-6xl font-bold">Sortable Tree</h1>
      <SortableTree defaultItems={sampleTreeItems} />
    </main>
  )
}

export default App
