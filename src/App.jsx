import { useState } from 'react'
import ProductApp from './ProductApp'
import './App.css'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ProductApp />
    </>
  )
}

export default App
