import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaTrash,
} from "react-icons/fa";

interface Task {
  id: number;
  name: string;
  status: "To-Do" | "In-Progress" | "Completed";
  category: string;
  dueDate: string;
  description: string | undefined;
}



const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<Record<string, boolean>>({
    "To-Do": false,
    "In-Progress": false,
    "Completed": false,
  });
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState<Task>({
    id: Date.now(),
    name: "",
    status: "To-Do",
    category: "",
    dueDate: "",
    description: "",
  });

  // Load tasks from local storage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  // Save tasks to local storage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const toggleCollapse = (section: string) => {
    setIsCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewTask((prev) => ({
        ...prev,
        attachment: e.target.files[0].name,
      }));
    }
  };

  const addTask = () => {
    if (!newTask.name || !newTask.dueDate || !newTask.category) {
      alert("Please fill all fields!");
      return;
    }
    console.log("hehe",newTask)
    const updatedTasks = [...tasks, { ...newTask, id: Date.now() }];
    setTasks(updatedTasks);
    setShowModal(false);

    // Reset form fields
    setNewTask({
      id: Date.now(),
      name: "",
      status: "To-Do",
      category: "",
      dueDate: "",
      description: "",
    });
  };

  const deleteTask = (id: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
  };

  const renderTasks = (status: string) =>
    tasks.filter((task) => task.status === status);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">TaskBuddy</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select className="p-2 border rounded-lg">
              <option>Category</option>
              <option>Work</option>
              <option>Personal</option>
              <option>Development</option>
              <option>Design</option>
              <option>Testing</option>
            </select>
            <select className="p-2 border rounded-lg">
              <option>Due Date</option>
              <option>Ascending</option>
              <option>Descending</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="p-2 pl-8 border rounded-lg outline-none"
            />
            <FaSearch className="absolute left-2 top-3 text-gray-400" />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            {/* <FaPlus className="mr-2" /> */}
            ADD TASK
          </button>
        </div>
      </div>

      {/* TASK SECTIONS */}
      {["To-Do", "In-Progress", "Completed"].map((section) => (
        <div key={section} className="mb-4">
          <div
            className={`flex justify-between items-center p-4 rounded-lg shadow-md ${
              section === "To-Do"
                ? "bg-pink-200"
                : section === "In-Progress"
                ? "bg-blue-200"
                : "bg-green-200"
            } cursor-pointer`}
            onClick={() => toggleCollapse(section)}
          >
            <h2 className="text-lg font-bold">
              {section} ({renderTasks(section).length})
            </h2>
            {isCollapsed[section] ? (
              <FaChevronDown />
            ) : (
              <FaChevronUp />
            )}
          </div>

          {!isCollapsed[section] && (
            <div className="p-4 bg-white shadow-lg rounded-lg">
              {renderTasks(section).length > 0 ? (
                renderTasks(section).map((task) => (
                  <div
                    key={task.id}
                    className="flex justify-between items-center p-3 border-b last:border-0"
                  >
                    <div>
                      <h3 className="font-semibold">{task.name}</h3>
                      <p className="text-sm text-gray-500">
                        Due: {task.dueDate} | {task.category}
                      </p>
                      <p>{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-red-500 hover:underline cursor-pointer"
                        onClick={() => deleteTask(task.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">
                  No Tasks in {section}
                </p>
              )}
            </div>
          )}
        </div>
      ))}

{/* test */}
{showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">Create Task</h2>

            {/* Task Title */}
            <input
              type="text"
              name="name"
              placeholder="Task title"
              value={newTask.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mb-3"
              required
            />

            {/* Task Description */}

            <textarea name="description" id="description" placeholder="Description" value={newTask.description} 
            onChange={e=>{
              setNewTask({
                ...newTask,
                description: e.target.value
              })
            }} className="w-full p-2 border rounded mb-3"></textarea>

            {/* Category Dropdown */}
            <div className="mb-3">
              <label className="block text-gray-600 font-semibold mb-1">
                Task Category
              </label>
              <select
                name="category"
                value={newTask.category}
                onChange={handleInputChange}
                className="p-2 border rounded w-full"
                required
              >
                <option value="">Choose Category</option>
                <option value="Meeting">Meeting</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Testing">Testing</option>
                <option value="Documentation">Documentation</option>
              </select>
            </div>

            <div className="flex gap-4 mb-3">
              {/* Due Date */}
              <input
                type="date"
                name="dueDate"
                value={newTask.dueDate}
                onChange={handleInputChange}
                className="p-2 border rounded w-1/2"
                required
              />

              {/* Task Status */}
              <select
                name="status"
                value={newTask.status}
                onChange={handleInputChange}
                className="p-2 border rounded w-1/2"
              >
                <option value="To-Do">To-Do</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* File Upload */}
            <input
              type="file"
              onChange={handleFileUpload}
              className="mb-3 w-full"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                CANCEL
              </button>
              <button
                onClick={addTask}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                CREATE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
