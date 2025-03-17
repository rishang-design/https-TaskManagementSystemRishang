import React from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [newTask, setNewTask] = React.useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), title: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={addTask}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {tasks.map(task => (
          <li
            key={task.id}
            className="flex items-center gap-2 p-2 border rounded"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="h-4 w-4"
            />
            <span className={task.completed ? 'line-through text-gray-500' : ''}>
              {task.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList; 


// import React, { useState } from "react";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { PlusCircle, Trash2, CheckCircle } from "react-icons/fi";

// interface Task {
//   id: string;
//   title: string;
//   category: string;
//   dueDate: string;
//   completed: boolean;
// }

// const initialTasks: Task[] = [
//   { id: "1", title: "Design Homepage UI", category: "Work", dueDate: "2025-03-20", completed: false },
//   { id: "2", title: "Grocery Shopping", category: "Personal", dueDate: "2025-03-18", completed: false },
// ];

// const TaskList: React.FC = () => {
//   const [tasks, setTasks] = useState<Task[]>(initialTasks);

//   const handleDragEnd = (result: any) => {
//     if (!result.destination) return;
//     const updatedTasks = [...tasks];
//     const [movedTask] = updatedTasks.splice(result.source.index, 1);
//     updatedTasks.splice(result.destination.index, 0, movedTask);
//     setTasks(updatedTasks);
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-4 bg-white shadow-lg rounded-lg">
//       <h2 className="text-xl font-semibold mb-4">Task List</h2>
//       {tasks.length === 0 ? (
//         <div className="text-center py-10 text-gray-500">No tasks available</div>
//       ) : (
//         <DragDropContext onDragEnd={handleDragEnd}>
//           <Droppable droppableId="taskList">
//             {(provided) => (
//               <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
//                 {tasks.map((task, index) => (
//                   <Draggable key={task.id} draggableId={task.id} index={index}>
//                     {(provided) => (
//                       <li
//                         {...provided.draggableProps}
//                         {...provided.dragHandleProps}
//                         ref={provided.innerRef}
//                         className="p-3 flex justify-between bg-gray-100 rounded-md shadow-sm"
//                       >
//                         <div>
//                           <p className="font-medium">{task.title}</p>
//                           <p className="text-sm text-gray-500">{task.category} - Due {task.dueDate}</p>
//                         </div>
//                         <div className="flex gap-2">
//                           <button className="text-green-500 hover:text-green-700">
//                             <CheckCircle size={18} />
//                           </button>
//                           <button className="text-red-500 hover:text-red-700">
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       </li>
//                     )}
//                   </Draggable>
//                 ))}
//                 {provided.placeholder}
//               </ul>
//             )}
//           </Droppable>
//         </DragDropContext>
//       )}
//       <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
//         <PlusCircle size={18} /> Add Task
//       </button>
//     </div>
//   );
// };

// export default TaskList;
