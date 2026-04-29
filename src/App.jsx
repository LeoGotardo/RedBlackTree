import { useState } from 'react'
import MazeSolver from './components/Screen.jsx'
import AlgorithmsPage from './components/AlgorithmsPage.jsx'

function App() {
  const [page, setPage] = useState('generator')
  return page === 'algorithms'
    ? <AlgorithmsPage setPage={setPage} />
    : <MazeSolver setPage={setPage} />
}

export default App
