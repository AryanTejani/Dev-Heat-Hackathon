import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axiosInstance from "../config/axios";
import { useNavigate } from "react-router-dom";
import { PlusIcon, RefreshCw, Users, MessageSquare, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const navigate = useNavigate();

  // Function to fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const res = await axiosInstance.get("/projects/all");
      setProjects(res.data.projects);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500); // Add a small delay for animation
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    fetchProjects();

    // Refresh projects every 30 seconds
    const intervalId = setInterval(fetchProjects, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Create a new project
  function createProject(e) {
    e.preventDefault();

    if (!projectName.trim()) return;

    axiosInstance
      .post("/projects/create", {
        name: projectName,
      })
      .then((res) => {
        // Add new project to state immediately
        setProjects((prev) => [...prev, res.data.project]);
        setProjectName("");
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error("Failed to create project:", error);
        alert("Failed to create project. Please try again.");
      });
  }

  // Delete a project
  const deleteProject = async (projectId, e) => {
    // Stop event propagation to prevent navigation
    e.stopPropagation();
    e.preventDefault();
    
    // Show confirmation dialog
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone and will remove all files and messages."
      )
    ) {
      return;
    }
    
    try {
      // Call API to delete the project
      await axiosInstance.delete(`/projects/delete/${projectId}`);
      
      // Update local state to remove the deleted project
      setProjects(projects.filter(project => project._id !== projectId));
      
      // Show success message
      setStatusMessage("Project deleted successfully");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error("Failed to delete project:", error);
      setStatusMessage("Failed to delete project: " + (error.response?.data?.error || error.message));
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  // Navigate to project
  const goToProject = (project) => {
    navigate(`/project?id=${project._id}`, {
      state: { project },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <button
            onClick={fetchProjects}
            disabled={isRefreshing}
            className={`px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-all flex items-center space-x-2 ${
              isRefreshing ? "opacity-75" : ""
            }`}
          >
            <RefreshCw
              size={18}
              className={`text-indigo-600 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span className="text-gray-700">Refresh</span>
          </button>
        </div>

        {/* Status Message Toast */}
        {statusMessage && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 px-4 rounded-lg shadow-lg z-50 animate-fade-in flex items-center">
            <i className="ri-information-line mr-2"></i>
            {statusMessage}
          </div>
        )}

        {loading && !isRefreshing ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm my-6">
            <p className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New Project Card */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group h-48 flex flex-col items-center justify-center text-white"
            >
              <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                <PlusIcon size={30} className="text-white" />
              </div>
              <h2 className="text-xl font-semibold">New Project</h2>
              <p className="text-indigo-100 text-sm mt-1">
                Start collaborating
              </p>
            </div>

            {/* Project Cards */}
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden border border-gray-100 hover:border-indigo-100 h-48 flex flex-col relative group"
              >
                {/* Delete Button - Visible on hover */}
                <button
                  onClick={(e) => deleteProject(project._id, e)}
                  className="absolute top-2 right-2 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 z-10"
                  title="Delete project"
                >
                  <Trash2 size={16} />
                </button>
                
                {/* Project Card Content - Clickable */}
                <div 
                  className="flex flex-col h-full"
                  onClick={() => goToProject(project)}
                >
                  <div className="p-6 flex-grow">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {project.name}
                    </h2>
                    <p className="text-gray-500 text-sm flex items-center">
                      <Users size={16} className="mr-2" />
                      {project.users.length}{" "}
                      {project.users.length === 1
                        ? "collaborator"
                        : "collaborators"}
                    </p>
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center">
                      <MessageSquare size={16} className="mr-2 text-indigo-500" />
                      Chat & Collaborate
                    </span>
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 text-xs">@ai</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 animate-fade-in">
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Project
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <form onSubmit={createProject} className="p-6">
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  placeholder="Enter project name..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
