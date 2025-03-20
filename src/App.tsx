import Login from './components/login'
import TaskList from './components/TaskList'
 
import { Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/tasklist" element={<TaskList />} />
      {/* <Route path="/taskform" element={<TaskForm />} /> */}
    </Routes>
      
    </>
  )
}

export default App
