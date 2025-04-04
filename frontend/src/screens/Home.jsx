import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axiosInstance from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Function to fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/projects/all");
      setProjects(res.data.projects);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
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

  // Navigate to project
  const goToProject = (project) => {
    navigate(`/project?id=${project._id}`, {
      state: { project },
    });
  };

  return (
    <main className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <button
          onClick={fetchProjects}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          <i className="ri-refresh-line mr-2"></i>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="projects flex flex-wrap gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="project p-4 border border-slate-300 rounded-md hover:bg-slate-100"
          >
            New Project
            <i className="ri-add-line ml-2"></i>
          </button>

          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => goToProject(project)}
              className="project flex flex-col gap-2 cursor-pointer p-4 border border-slate-300 rounded-md min-w-52 hover:bg-slate-200"
            >
              <h2 className="font-semibold">{project.name}</h2>

              <div className="flex gap-2">
                <p>
                  {" "}
                  <small>
                    {" "}
                    <i className="ri-user-line"></i> Collaborators
                  </small>{" "}
                  :
                </p>
                {project.users.length}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md w-1/3">
            <h2 className="text-xl mb-4">Create New Project</h2>
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
