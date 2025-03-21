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
  FaCheckSquare,
  FaRegSquare,
  FaTrashAlt,
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

  const [dueDateSort, setDueDateSort] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userName, setUserName] = useState<string>('User');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
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

  // Keep only the auth check useEffect
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const name = user.displayName || user.email?.split('@')[0] || 'User';
      setUserName(name);
    } else {
      navigate('/');
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/');
      }
    });

    return () => unsubscribe();
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

  const handleDueDateSort = () => {
    setDueDateSort(current => current === 'asc' ? 'desc' : 'asc');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') {
      return;
    }
  };

  // Update the filteredAndSortedTasks function to include search
  const filteredAndSortedTasks = (status: string) => {
    let filtered = tasks.filter(task => task.status === status);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.name.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.dueDate.includes(query)
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(task => task.category === filterCategory);
    }

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
      // Remove only auth-related data
      localStorage.removeItem('userName');
      // Keep tasks data in localStorage
      navigate('/', { replace: true });
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

  // Add these new functions for batch operations
  const toggleTaskSelection = (taskId: number) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleAllTasksInSection = (section: string) => {
    const sectionTaskIds = renderTasks(section).map(task => task.id);
    
    setSelectedTasks(prev => {
      const allSelected = sectionTaskIds.every(id => prev.includes(id));
      if (allSelected) {
        // Deselect all tasks in this section
        return prev.filter(id => !sectionTaskIds.includes(id));
      } else {
        // Select all tasks in this section
        return [...new Set([...prev, ...sectionTaskIds])];
      }
    });
  };

  const deleteSelectedTasks = () => {
    if (selectedTasks.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
      setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
      setSelectedTasks([]); // Clear selection after delete
    }
  };

  // Modify your existing renderTaskActions function
  const renderTaskActions = (task: Task) => (
    <div className="flex items-center gap-2">
      <button
        className="text-gray-500 hover:text-gray-700 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          toggleTaskSelection(task.id);
        }}
      >
        {selectedTasks.includes(task.id) ? (
          <FaCheckSquare className="text-purple-600" />
        ) : (
          <FaRegSquare />
        )}
      </button>
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

  // Add this section header component
  const renderSectionHeader = (section: string) => {
    const sectionTasks = renderTasks(section);
    const allSelected = sectionTasks.length > 0 && 
      sectionTasks.every(task => selectedTasks.includes(task.id));

    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleAllTasksInSection(section);
            }}
          >
            {allSelected ? (
              <FaCheckSquare className="text-purple-600" />
            ) : (
              <FaRegSquare />
            )}
          </button>
          <h2 className="text-lg font-bold">
            {section} ({renderTasks(section).length})
          </h2>
        </div>
        {isCollapsed[section] ? <FaChevronDown /> : <FaChevronUp />}
      </div>
    );
  };

  // Add these new functions at the component level
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData('taskId'));
    
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: targetStatus }
          : task
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <img
            src="./src/assets/tasklogo.png"
            alt="tasklistlogo"
            className="w-6 h-6 sm:w-8 sm:h-8"
          />
          <h4 className="text-xl sm:text-2xl text-gray-900 font-semibold">TaskBuddy</h4>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
          <div className="flex items-center gap-2 text-gray-500">
            <CgProfile />
            <span className="capitalize">{userName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-purple-600 transition-colors text-sm sm:text-base"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Toggle View and Filter Section */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-white p-2 sm:p-3 rounded-md shadow-md">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-md ${
              view === "list" ? "focus:border-b border-2 text-gray" : "bg-black-200"
            }`}
          >
            <FaBars /> List
          </button>
          <button
            onClick={() => setView("board")}
            className={`flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-md ${
              view === "board" ? "focus:border-b border-2 text-grey" : "bg-black-200"
            }`}
          >
            <CiViewBoard /> Board
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-white p-2 sm:p-3 rounded-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <p className="text-gray-500 text-sm sm:text-base">Filter by:</p>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <select 
                className="p-2 text-gray-500 border rounded-3xl shadow-md text-sm sm:text-base w-full sm:w-auto"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Development">Development</option>
              </select>
              <select 
                className="p-2 text-gray-500 border rounded-3xl shadow-md text-sm sm:text-base w-full sm:w-auto"
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
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full p-2 pl-10 border rounded-3xl outline-none text-sm sm:text-base"
              />
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={handleSearch}
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-3xl hover:bg-purple-700 shadow-md transition text-sm sm:text-base"
            >
              ADD TASK
            </button>
          </div>
        </div>
      </div>

      {/* Add batch actions bar */}
      <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-md shadow-md">
        <div className="flex items-center gap-4">
          {/* Existing view toggle buttons */}
        </div>
        {selectedTasks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">
              {selectedTasks.length} task(s) selected
            </span>
            <button
              onClick={deleteSelectedTasks}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <FaTrashAlt />
              Delete Selected
            </button>
          </div>
        )}
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
                {renderSectionHeader(section)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {["To-Do", "In-Progress", "Completed"].map((section) => (
              <div 
                key={section} 
                className="bg-white p-3 sm:p-4 rounded-lg shadow-md"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, section as Task['status'])}
              >
                <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{section}</h2>

                {renderTasks(section).length > 0 ? (
                  filteredAndSortedTasks(section).map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-100 p-3 rounded-md shadow-md mb-3 cursor-move hover:shadow-lg transition-shadow"
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, task)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{task.name}</h3>
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
                  <div 
                    className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-gray-500 text-center"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, section as Task['status'])}
                  >
                    Drop tasks here
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Create Task</h2>
            <input
              type="text"
              name="name"
              placeholder="Task title"
              value={newTask.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mb-3"
              required
            />
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
              <input
                type="date"
                name="dueDate"
                value={newTask.dueDate}
                onChange={handleInputChange}
                className="p-2 border rounded w-1/2"
                required
              />
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
            <input
              type="file"
              onChange={handleFileUpload}
              className="mb-3 w-full"
            />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
            <input
              type="text"
              name="name"
              placeholder="Task title"
              value={editingTask.name}
              onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
              className="w-full p-2 border rounded mb-3"
              required
            />
            <textarea 
              name="description" 
              placeholder="Description" 
              value={editingTask.description} 
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />
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
