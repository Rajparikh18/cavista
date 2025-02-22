import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      This is the frontend
      <div>
        <img src={reactLogo} alt="react logo" className="logo" />
        <img src={viteLogo} alt="vite logo" className="logo" />
      </div>
    </>
  )
}

export default App
