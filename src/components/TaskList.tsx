import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { CgProfile } from "react-icons/cg";
import { CiViewBoard } from "react-icons/ci";
import {
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaTrash,
  FaBars,
  FaSort,
  FaSignOutAlt,
  FaEdit,
} from "react-icons/fa";
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface Task {
  id: number;
  name: string;
  status: "To-Do" | "In-Progress" | "Completed";
  category: string;
  dueDate: string;
  description: string | undefined;
}

interface SortConfig {
  key: keyof Task | null;
  direction: 'asc' | 'desc';
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<Record<string, boolean>>({
    "To-Do": false,
    "In-Progress": false,
    "Completed": false,
  });

  const [view, setView] = useState<"list" | "board">("list"); // View state
  const [showModal, setShowModal] = useState(false);

  const [newTask, setNewTask] = useState<Task>({
    id: Date.now(),
    name: "",
    status: "To-Do",
    category: "",
    dueDate: "",
    description: "",
  });

  const [filterCategory, setFilterCategory] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc'
  });

  // Add this new state for due date sorting
  const [dueDateSort, setDueDateSort] = useState<'asc' | 'desc'>('asc');

  // Add new state for search
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add state for user name
  const [userName, setUserName] = useState<string>('User');

  // Add these new states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const navigate = useNavigate();

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

  // Add useEffect to get user info when component mounts
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Get name from email by splitting at '@' or use displayName if available
      const name = user.displayName || user.email?.split('@')[0] || 'User';
      setUserName(name);
    } else {
      // If no user is found, redirect to login
      navigate('/');
    }
  }, [navigate]);

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
        description: e.target.files[0].name,
      }));
    }
  };

  const addTask = () => {
    if (!newTask.name || !newTask.dueDate || !newTask.category) {
      alert("Please fill all fields!");
      return;
    }

    const updatedTasks = [...tasks, { ...newTask, id: Date.now() }];
    setTasks(updatedTasks);
    setShowModal(false);

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

  const sortTasks = (tasks: Task[]) => {
    if (!sortConfig.key) return tasks;

    return [...tasks].sort((a, b) => {
      if (a[sortConfig.key!] < b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key!] > b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleSort = (key: keyof Task) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Add this function to handle due date sorting
  const handleDueDateSort = () => {
    setDueDateSort(current => current === 'asc' ? 'desc' : 'asc');
  };

  // Add search handler function
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') {
      return;
    }
    // Search will be applied in filteredAndSortedTasks
  };

  // Update the filteredAndSortedTasks function to include search
  const filteredAndSortedTasks = (status: string) => {
    let filtered = tasks.filter(task => task.status === status);
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.name.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.dueDate.includes(query)
      );
    }

    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter(task => task.category === filterCategory);
    }

    // Apply sorting
    if (sortConfig.key === 'dueDate') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0;
        }
        
        return sortConfig.direction === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      });
    } else if (sortConfig.key) {
      filtered = sortTasks(filtered);
    }

    return filtered;
  };

  // Update the handleLogout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear any stored user data
      localStorage.clear();
      // Navigate to login page
      navigate('/', { replace: true }); // Using replace to prevent going back
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error logging out. Please try again.');
    }
  };

  // Add this new function to handle edit
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  // Add this function to handle update
  const updateTask = () => {
    if (!editingTask) return;
    
    if (!editingTask.name || !editingTask.dueDate || !editingTask.category) {
      alert("Please fill all fields!");
      return;
    }

    const updatedTasks = tasks.map(task => 
      task.id === editingTask.id ? editingTask : task
    );
    
    setTasks(updatedTasks);
    setShowEditModal(false);
    setEditingTask(null);
  };

  // Modify the task rendering in both list and board views
  const renderTaskActions = (task: Task) => (
    <div className="flex items-center gap-2">
      <button
        className="text-blue-500 hover:text-blue-700 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(task);
        }}
      >
        <FaEdit />
      </button>
      <button
        className="text-red-500 hover:text-red-700 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          deleteTask(task.id);
        }}
      >
        <FaTrash />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <img
            src="./src/assets/tasklogo.png"
            alt="tasklistlogo"
            className="w-8 h-8"
          />
          <h4 className="text-2xl text-gray-900 font-semibold">TaskBuddy</h4>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <CgProfile />
            <span className="capitalize">{userName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Toggle View Buttons */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-md shadow-md">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${  view === "list" ? "focus:border-b border-2  text-gray" : "bg-black-200"  }`} 
        >
          <FaBars /> List
        </button>

        <button  onClick={() => setView("board")}  className={`flex items-center gap-2 px-4 py-2 rounded-md ${  view === "board" ? "focus:border-b border-2 text-grey" : "bg-black-200"  }`}
        >
          <CiViewBoard /> Board
        </button>
      </div>
        <div className="flex items-center gap-4 bg-white">
          <div className="flex items-center gap-2">
            <p className="text-gray-500">Filter by:</p>
            <select 
              className="p-2 text-gray-500 border rounded-3xl shadow-md"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Development">Development</option>
            </select>
            <select 
              className="p-2 text-gray-500 border rounded-3xl shadow-md"
              value={sortConfig.key === 'dueDate' ? sortConfig.direction : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setSortConfig({
                    key: 'dueDate',
                    direction: e.target.value as 'asc' | 'desc'
                  });
                }
              }}
            >
              <option value="">Sort by Due Date</option>
              <option value="asc">Earliest First</option>
              <option value="desc">Latest First</option>
            </select>
          </div>

          <div className="flex justify-end items-center p-3 py-3 bg-white">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full p-2 pl-10 border rounded-3xl outline-none"
              />
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={handleSearch}
              />
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-3xl hover:bg-purple-700 shadow-md transition"> ADD TASK</button>
        </div>


      {/* Render Task Sections Based on View */}
      {view === "list" ? (
        <>
          {/* List View */}
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="grid grid-cols-4 gap-4 p-4 border-b">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('name')}>
                Task Name <FaSort className={sortConfig.key === 'name' ? 'text-purple-600' : 'text-gray-400'} />
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('dueDate')}>
                Due On <FaSort className={`${
                  sortConfig.key === 'dueDate' 
                    ? sortConfig.direction === 'asc' 
                      ? 'text-purple-600 rotate-180' 
                      : 'text-purple-600' 
                    : 'text-gray-400'
                }`} />
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('status')}>
                Task Status <FaSort className={sortConfig.key === 'status' ? 'text-purple-600' : 'text-gray-400'} />
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('category')}>
                Task Category <FaSort className={sortConfig.key === 'category' ? 'text-purple-600' : 'text-gray-400'} />
              </div>
            </div>
          </div>
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
                    filteredAndSortedTasks(section).map((task) => (
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
                        {renderTaskActions(task)}
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
        </>
      ) : (
        <>
          {/* Board View */}
          <div className="grid grid-cols-3 gap-4 mt-6" >
            {["To-Do", "In-Progress", "Completed"].map((section) => (
              <div key={section} className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-bold mb-4" >{section}</h2>

                {renderTasks(section).length > 0 ? (
                  renderTasks(section).map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-100 p-3 rounded-md shadow-md mb-3" draggable="true"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold" >{task.name}</h3>
                          <p className="text-sm text-gray-500">
                            Due: {task.dueDate} | {task.category}
                          </p>
                          <p>{task.description}</p>
                        </div>
                        {renderTaskActions(task)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No Tasks in {section}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Add Modal */}
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
            <textarea 
              name="description" 
              placeholder="Description" 
              value={newTask.description} 
              onChange={e => {
                setNewTask({
                  ...newTask,
                  description: e.target.value
                })
              }} 
              className="w-full p-2 border rounded mb-3"
            />

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
                <option>Category</option>
                <option>Work</option>
                <option>Personal</option>
                <option>Development</option>
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

      {/* Edit Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">Edit Task</h2>

            {/* Task Title */}
            <input
              type="text"
              name="name"
              placeholder="Task title"
              value={editingTask.name}
              onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
              className="w-full p-2 border rounded mb-3"
              required
            />

            {/* Task Description */}
            <textarea 
              name="description" 
              placeholder="Description" 
              value={editingTask.description} 
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />

            {/* Category Dropdown */}
            <div className="mb-3">
              <label className="block text-gray-600 font-semibold mb-1">
                Task Category
              </label>
              <select
                name="category"
                value={editingTask.category}
                onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                className="p-2 border rounded w-full"
                required
              >
                <option value="">Choose Category</option>
                <option>Work</option>
                <option>Personal</option>
                <option>Development</option>
              </select>
            </div>

            <div className="flex gap-4 mb-3">
              {/* Due Date */}
              <input
                type="date"
                name="dueDate"
                value={editingTask.dueDate}
                onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                className="p-2 border rounded w-1/2"
                required
              />

              {/* Task Status */}
              <select
                name="status"
                value={editingTask.status}
                onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as Task['status'] })}
                className="p-2 border rounded w-1/2"
              >
                <option value="To-Do">To-Do</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTask(null);
                }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                CANCEL
              </button>
              <button
                onClick={updateTask}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                UPDATE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
