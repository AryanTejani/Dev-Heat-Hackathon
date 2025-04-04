import React, { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import { getWebContainer } from "../config/webcontainer";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const Project = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get projectId from URL query params to maintain state across refreshes
  const queryParams = new URLSearchParams(location.search);
  const projectIdFromUrl = queryParams.get("id");

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [project, setProject] = useState(location.state?.project || {});
  const [message, setMessage] = useState("");
  const { user, setUser } = useContext(UserContext);
  const messageBox = useRef(null);

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);

  const [runProcess, setRunProcess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [containerStatus, setContainerStatus] = useState("Not started");
  const [statusMessage, setStatusMessage] = useState("");
  const [projectLoading, setProjectLoading] = useState(true);

  // Function to extract and process file tree from AI messages
  const processAiMessage = (message) => {
    try {
      // Try to parse the message as JSON
      let parsedData;
      try {
        parsedData = JSON.parse(message);
      } catch (error) {
        console.log("Message is not valid JSON, treating as plain text");
        return null;
      }

      // Initialize the new file tree
      let newFileTree = {};

      // Case 1: Message contains a fileTree property directly
      if (parsedData.fileTree && typeof parsedData.fileTree === "object") {
        console.log("Found fileTree property in message");
        newFileTree = { ...parsedData.fileTree };
      }

      // Case 2: Message contains individual file definitions (html, css, js, etc.)
      const fileTypes = [
        "html",
        "css",
        "javascript",
        "js",
        "ts",
        "json",
        "md",
        "py",
        "java",
        "c",
        "cpp",
      ];
      let hasFiles = false;

      fileTypes.forEach((type) => {
        if (parsedData[type] && parsedData[type].file) {
          hasFiles = true;

          // Determine appropriate filename based on type
          let filename;
          switch (type) {
            case "html":
              filename = "index.html";
              break;
            case "css":
              filename = "style.css";
              break;
            case "javascript":
            case "js":
              filename = "script.js";
              break;
            case "ts":
              filename = "script.ts";
              break;
            case "json":
              filename = "data.json";
              break;
            case "md":
              filename = "README.md";
              break;
            case "py":
              filename = "main.py";
              break;
            case "java":
              filename = "Main.java";
              break;
            case "c":
              filename = "main.c";
              break;
            case "cpp":
              filename = "main.cpp";
              break;
            default:
              filename = `file.${type}`;
              break;
          }

          newFileTree[filename] = parsedData[type];
        }
      });

      // Case 3: Message contains files property with an array of files
      if (parsedData.files && Array.isArray(parsedData.files)) {
        console.log("Found files array in message");
        parsedData.files.forEach((fileObj) => {
          if (fileObj.name && fileObj.content) {
            hasFiles = true;
            newFileTree[fileObj.name] = {
              file: {
                contents: fileObj.content,
              },
            };
          }
        });
      }

      // Case 4: Look for named file objects directly in the message
      Object.keys(parsedData).forEach((key) => {
        // Check if the key looks like a filename (contains a dot)
        if (
          key.includes(".") &&
          parsedData[key] &&
          (typeof parsedData[key] === "string" ||
            (parsedData[key].file && parsedData[key].file.contents))
        ) {
          hasFiles = true;

          // If it's a string, convert to proper file object
          if (typeof parsedData[key] === "string") {
            newFileTree[key] = {
              file: {
                contents: parsedData[key],
              },
            };
          } else {
            newFileTree[key] = parsedData[key];
          }
        }
      });

      // If we found files using any method, return the new file tree
      if (Object.keys(newFileTree).length > 0 || hasFiles) {
        console.log("Processed file tree from AI:", newFileTree);
        return newFileTree;
      }

      return null;
    } catch (error) {
      console.error("Error processing AI message:", error);
      return null;
    }
  };

  // Extract file content request from user message
  const extractFileRequest = (message) => {
    // Common patterns for requesting file creation
    const patterns = [
      /create\s+(?:a|an)?\s+file\s+(?:called|named)?\s+["']?([a-zA-Z0-9_\-.]+)["']?/i,
      /make\s+(?:a|an)?\s+(?:new)?\s+file\s+(?:called|named)?\s+["']?([a-zA-Z0-9_\-.]+)["']?/i,
      /generate\s+(?:a|an)?\s+file\s+(?:called|named)?\s+["']?([a-zA-Z0-9_\-.]+)["']?/i,
      /give\s+(?:me)?\s+(?:a|an)?\s+(?:code|file)\s+for\s+["']?([a-zA-Z0-9_\-.]+)["']?/i,
      /write\s+(?:a|an)?\s+(?:code|file)\s+for\s+["']?([a-zA-Z0-9_\-.]+)["']?/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const getLanguageFromFilename = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();

    const extensionMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      html: "html",
      css: "css",
      json: "json",
      py: "python",
      java: "java",
      c: "c",
      cpp: "cpp",
      md: "markdown",
    };

    return extensionMap[extension] || "plaintext";
  };

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });
  };

  // Load project data - this is a critical function to ensure persistence
  const loadProjectData = async (projectId) => {
    try {
      setProjectLoading(true);
      const response = await axiosInstance.get(
        `/projects/get-project/${projectId}`
      );
      console.log("Project data loaded:", response.data.project);

      // Update project in state
      setProject(response.data.project);

      // Update URL if needed to include project ID
      if (!projectIdFromUrl) {
        navigate(`/project?id=${projectId}`, {
          replace: true,
          state: { project: response.data.project },
        });
      }

      // Store the file tree and log it for debugging
      const projectFileTree = response.data.project.fileTree || {};
      console.log("Initial file tree:", projectFileTree);
      setFileTree(projectFileTree);

      // If file tree is not empty and WebContainer is ready, mount it
      if (Object.keys(projectFileTree).length > 0 && webContainer) {
        mountFileTreeToContainer(webContainer, projectFileTree);
      }

      return response.data.project;
    } catch (err) {
      console.error("Failed to fetch project:", err);
      if (err.response && err.response.status === 401) {
        // Handle authentication error without redirecting
        // This allows the component to try re-authenticating
        const token = localStorage.getItem("token");
        if (token) {
          try {
            // Try to refresh user data
            const userResponse = await axiosInstance.get("/users/me");
            setUser(userResponse.data.user);
            // Retry loading project
            return loadProjectData(projectId);
          } catch (authError) {
            console.error("Authentication failed:", authError);
          }
        }
      }
      return null;
    } finally {
      setProjectLoading(false);
    }
  };

  function addCollaborators() {
    if (!project?._id) {
      setStatusMessage("Project not loaded properly");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    axiosInstance
      .put("/projects/add-user", {
        projectId: project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log("Collaborators added successfully:", res.data);
        setIsModalOpen(false);

        // Immediately update the project state with new collaborators
        if (res.data.project) {
          setProject(res.data.project);
        } else {
          // If the API doesn't return updated project, reload it
          loadProjectData(project._id);
        }

        setStatusMessage("Collaborators added successfully");
        setTimeout(() => setStatusMessage(""), 3000);
      })
      .catch((err) => {
        console.error("Failed to add collaborators:", err);
        setStatusMessage("Failed to add collaborators");
        setTimeout(() => setStatusMessage(""), 3000);
      });
  }

  const send = () => {
    if (!project?._id || !user || !message.trim()) return;

    sendMessage("project-message", {
      message,
      sender: user,
      projectId: project._id, // Include project ID for better tracking
    });
    setMessages((prevMessages) => [...prevMessages, { sender: user, message }]);
    setMessage("");
  };

  function WriteAiMessage(message) {
    try {
      const messageObject = JSON.parse(message);
      return (
        <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
          <Markdown
            children={messageObject.text || message}
            options={{
              overrides: {
                code: SyntaxHighlightedCode,
              },
            }}
          />
        </div>
      );
    } catch (error) {
      console.warn("Failed to parse AI message as JSON:", error);
      return (
        <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
          <Markdown
            children={message}
            options={{
              overrides: {
                code: SyntaxHighlightedCode,
              },
            }}
          />
        </div>
      );
    }
  }

  // Initialize WebContainer separately to better handle errors
  const initializeWebContainer = async () => {
    try {
      setContainerStatus("Initializing...");
      const container = await getWebContainer();
      setWebContainer(container);
      setContainerStatus("Ready");
      console.log("WebContainer started successfully");

      // Set up listener for server-ready event
      container.on("server-ready", (port, url) => {
        console.log("Server ready on port:", port);
        console.log("URL to display:", url);
        setIframeUrl(url);
      });

      return container;
    } catch (err) {
      setContainerStatus("Failed to initialize");
      console.error("Failed to start WebContainer:", err);
      return null;
    }
  };

  // Mount file tree to WebContainer
  const mountFileTreeToContainer = async (container, tree) => {
    if (!container) {
      console.error("Cannot mount file tree: WebContainer not initialized");
      return false;
    }

    try {
      console.log("Mounting file tree:", tree);
      await container.mount(tree);
      console.log("File tree mounted successfully");
      return true;
    } catch (err) {
      console.error("Failed to mount file tree:", err);
      return false;
    }
  };

  // Determine project ID to use (from URL, state, or props)
  const getProjectId = () => {
    // First priority: URL parameter
    if (projectIdFromUrl) {
      return projectIdFromUrl;
    }

    // Second priority: Project from location state
    if (location.state?.project?._id) {
      return location.state.project._id;
    }

    // Third priority: Current project state
    if (project?._id) {
      return project._id;
    }

    // No project ID found
    return null;
  };

  // Main initialization effect - runs once on component mount
  useEffect(() => {
    const projectId = getProjectId();

    if (!projectId) {
      console.error("No project ID found");
      navigate("/");
      return;
    }

    // Initialize WebContainer right away
    const containerPromise = initializeWebContainer();

    // Load project data
    loadProjectData(projectId).then((loadedProject) => {
      if (!loadedProject) {
        console.error("Failed to load project data");
        return;
      }

      // Initialize socket connection
      initializeSocket(projectId);

      // Set up message listener
      receiveMessage("project-message", (data) => {
        console.log("Received message:", data);

        if (data.sender?._id === "ai") {
          try {
            // Process the AI message to extract file information
            const newFileTree = processAiMessage(data.message);

            if (newFileTree && Object.keys(newFileTree).length > 0) {
              // Merge with existing file tree (keeping existing files)
              const mergedFileTree = { ...fileTree, ...newFileTree };

              // Update the file tree state
              setFileTree(mergedFileTree);

              // Save the updated file tree to the server
              saveFileTree(mergedFileTree);

              // Try to mount the file tree if WebContainer is available
              if (webContainer) {
                mountFileTreeToContainer(webContainer, mergedFileTree).then(
                  (success) => {
                    if (success) {
                      console.log("File tree mounted from AI message");

                      // If new files were added, open the first one
                      const newFiles = Object.keys(newFileTree);
                      if (newFiles.length > 0) {
                        setCurrentFile(newFiles[0]);
                        setOpenFiles((prev) => [
                          ...new Set([...prev, newFiles[0]]),
                        ]);
                        setStatusMessage(
                          `Created ${
                            newFiles.length
                          } new file(s): ${newFiles.join(", ")}`
                        );
                        setTimeout(() => setStatusMessage(""), 5000);
                      }
                    }
                  }
                );
              }
            }

            setMessages((prevMessages) => [...prevMessages, data]);
          } catch (error) {
            console.error("Error processing AI message:", error);
            setMessages((prevMessages) => [...prevMessages, data]);
          }
        } else {
          // Check if user is requesting a specific file
          const requestedFile = extractFileRequest(data.message);
          if (requestedFile) {
            console.log(`User requested to create file: ${requestedFile}`);
            // You could set some state here to indicate to the AI that a file was requested
          }

          setMessages((prevMessages) => [...prevMessages, data]);
        }
      });

      // Fetch users
      axiosInstance
        .get("/users/all")
        .then((res) => {
          setUsers(res.data.users);
        })
        .catch((err) => {
          console.error("Failed to fetch users:", err);
        });

      // Set up periodic refresh of project data
      const projectRefreshInterval = setInterval(() => {
        // Silently refresh project data to keep it updated
        axiosInstance
          .get(`/projects/get-project/${projectId}`)
          .then((res) => {
            setProject(res.data.project);
          })
          .catch((err) => {
            console.error("Failed to refresh project data:", err);
          });
      }, 30000); // Every 30 seconds

      return () => {
        clearInterval(projectRefreshInterval);
      };
    });

    // Cleanup function
    return () => {
      if (runProcess) {
        try {
          runProcess.kill();
        } catch (err) {
          console.error("Error killing process:", err);
        }
      }
    };
  }, []);

  // Effect to mount file tree when WebContainer becomes available
  useEffect(() => {
    if (webContainer && Object.keys(fileTree).length > 0) {
      console.log("WebContainer is now available, mounting file tree");
      mountFileTreeToContainer(webContainer, fileTree);
    }
  }, [webContainer]);

  function saveFileTree(ft) {
    if (!project?._id) return;

    console.log("Saving file tree:", ft);
    axiosInstance
      .put("/projects/update-file-tree", {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => {
        console.log("File tree saved successfully:", res.data);
      })
      .catch((err) => {
        console.error("Failed to save file tree:", err);
      });
  }

  function scrollToBottom() {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getFileContents = (file) => {
    if (
      !fileTree[file] ||
      !fileTree[file].file ||
      !fileTree[file].file.contents
    ) {
      return "";
    }
    return fileTree[file].file.contents;
  };

  // Improved runProject function to fix execution issues
  const runProject = async () => {
    if (!webContainer) {
      console.error("WebContainer not initialized");
      setStatusMessage(
        "WebContainer not initialized. Please refresh the page."
      );
      setTimeout(() => setStatusMessage(""), 5000);
      return;
    }

    setIsLoading(true);
    setStatusMessage("Setting up project...");

    try {
      console.log("Running project with file tree:", fileTree);

      // Ensure file tree is mounted
      const mountSuccess = await mountFileTreeToContainer(
        webContainer,
        fileTree
      );
      if (!mountSuccess) {
        console.error("Failed to mount file tree before running");
        setStatusMessage("Failed to mount file tree. Please try again.");
        setTimeout(() => setStatusMessage(""), 5000);
        setIsLoading(false);
        return;
      }

      // Determine project type and create necessary files
      const fileNames = Object.keys(fileTree);
      const hasHtmlFile = fileNames.some((file) => file.endsWith(".html"));
      const hasJsFile = fileNames.some(
        (file) => file.endsWith(".js") && file !== "server.js"
      );
      const hasPythonFile = fileNames.some((file) => file.endsWith(".py"));
      const hasPackageJson = fileNames.includes("package.json");

      // Kill any existing process
      if (runProcess) {
        console.log("Killing existing process");
        try {
          await runProcess.kill();
          setRunProcess(null);
        } catch (err) {
          console.error("Error killing process:", err);
        }
      }

      // Create necessary files based on project type
      if (hasHtmlFile && !fileNames.includes("server.js")) {
        setStatusMessage("Creating server for HTML project...");
        // Create a simple server for HTML projects
        const serverCode = `
const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static('./'));

// Start the server
app.listen(port, () => {
  console.log(\`Server listening on port \${port}\`);
});`;

        await webContainer.fs.writeFile("server.js", serverCode);
      }

      // Create package.json if it doesn't exist but is needed
      if (!hasPackageJson && (hasHtmlFile || hasJsFile)) {
        setStatusMessage("Creating package.json...");
        const packageJson = {
          name: "web-project",
          version: "1.0.0",
          description: "Web project created in collaboration",
          main: "server.js",
          scripts: {
            start: hasHtmlFile
              ? "node server.js"
              : hasJsFile
              ? `node ${fileNames.find(
                  (f) => f.endsWith(".js") && f !== "server.js"
                )}`
              : "echo 'No start script defined'",
          },
          dependencies: {
            express: "^4.17.1",
          },
        };

        await webContainer.fs.writeFile(
          "package.json",
          JSON.stringify(packageJson, null, 2)
        );
      }

      // For Python projects
      if (hasPythonFile && !fileNames.includes("requirements.txt")) {
        setStatusMessage("Setting up Python environment...");
        await webContainer.fs.writeFile(
          "requirements.txt",
          "# No requirements specified\n"
        );
      }

      // Install dependencies based on project type
      if (hasPackageJson || hasHtmlFile || hasJsFile) {
        setStatusMessage("Installing npm dependencies...");
        console.log("Installing npm dependencies...");

        const installProcess = await webContainer.spawn("npm", ["install"]);

        // Create a writable stream to capture installation output
        const installOutput = [];
        installProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              installOutput.push(chunk);
              console.log("Install output:", chunk);
            },
          })
        );

        // Wait for installation to complete
        const installExitCode = await installProcess.exit;
        console.log("Installation completed with exit code:", installExitCode);

        if (installExitCode !== 0) {
          setStatusMessage(`Installation failed with code ${installExitCode}`);
          setTimeout(() => setStatusMessage(""), 5000);
          setIsLoading(false);
          return;
        }
      } else if (hasPythonFile) {
        setStatusMessage("Installing Python dependencies...");
        console.log("Installing Python dependencies...");

        const pipProcess = await webContainer.spawn("pip", [
          "install",
          "-r",
          "requirements.txt",
        ]);

        // Log installation output
        const pipOutput = [];
        pipProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              pipOutput.push(chunk);
              console.log("Pip install output:", chunk);
            },
          })
        );

        const pipExitCode = await pipProcess.exit;
        if (pipExitCode !== 0) {
          setStatusMessage(`Pip installation failed with code ${pipExitCode}`);
          setTimeout(() => setStatusMessage(""), 5000);
          setIsLoading(false);
          return;
        }
      }

      // Start the application based on project type
      setStatusMessage("Starting application...");
      console.log("Starting application...");
      let newRunProcess;

      if (hasPackageJson || hasHtmlFile || hasJsFile) {
        newRunProcess = await webContainer.spawn("npm", ["start"]);
      } else if (hasPythonFile) {
        const mainPyFile = fileNames.find((f) => f.endsWith(".py"));
        newRunProcess = await webContainer.spawn("python", [mainPyFile]);
      } else {
        console.error("Unsupported project type");
        setStatusMessage(
          "Unsupported project type. Please add HTML, JS, or Python files."
        );
        setTimeout(() => setStatusMessage(""), 5000);
        setIsLoading(false);
        return;
      }

      setRunProcess(newRunProcess);

      // Log application output
      const appOutput = [];
      newRunProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            appOutput.push(chunk);
            console.log("App output:", chunk);

            // Update status with latest output
            setStatusMessage(`Running: ${chunk}`);
            setTimeout(() => setStatusMessage(""), 3000);
          },
        })
      );

      console.log("Application started");
      setStatusMessage("Application started successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error("Error running the project:", error);
      setStatusMessage("Error running project: " + error.message);
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while project data is being fetched
  if (projectLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen flex">
      <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0">
          <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
            <i className="ri-add-fill mr-1"></i>
            <p>Add collaborator</p>
          </button>
          <div className="flex items-center">
            <span className="text-sm mr-2">{project?.name || "Project"}</span>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2"
            >
              <i className="ri-group-fill"></i>
            </button>
          </div>
        </header>
        <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
          <div
            ref={messageBox}
            className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.sender?._id === "ai" ? "max-w-80" : "max-w-52"
                } ${
                  msg.sender?._id === user?._id?.toString() && "ml-auto"
                }  message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}
              >
                <small className="opacity-65 text-xs">
                  {msg.sender?.email || "Unknown"}
                </small>
                <div className="text-sm">
                  {msg.sender?._id === "ai" ? (
                    WriteAiMessage(msg.message)
                  ) : (
                    <p>{msg.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="inputField w-full flex absolute bottom-0">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && send()}
              className="p-2 px-4 border-none outline-none flex-grow"
              type="text"
              placeholder="Enter message"
            />
            <button onClick={send} className="px-5 bg-slate-950 text-white">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0`}
        >
          <header className="flex justify-between items-center px-4 p-2 bg-slate-200">
            <h1 className="font-semibold text-lg">Collaborators</h1>

            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2"
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2">
            {project?.users &&
              project.users.map((user, index) => {
                return (
                  <div
                    key={index}
                    className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center"
                  >
                    <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                      <i className="ri-user-fill absolute"></i>
                    </div>
                    <h1 className="font-semibold text-lg">{user.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
      <section className="right bg-red-50 flex-grow h-full flex">
        <div className="explorer h-full max-w-64 min-w-52 bg-slate-200 flex flex-col">
          <div className="explorer-header p-2 flex justify-between items-center bg-slate-300">
            <h3 className="font-semibold">Files</h3>
            <button
              onClick={() => {
                const fileName = prompt("Enter file name:");
                if (fileName && fileName.trim()) {
                  const newFileTree = {
                    ...fileTree,
                    [fileName.trim()]: {
                      file: {
                        contents: "",
                      },
                    },
                  };
                  setFileTree(newFileTree);
                  setCurrentFile(fileName.trim());
                  setOpenFiles((prev) => [
                    ...new Set([...prev, fileName.trim()]),
                  ]);
                  saveFileTree(newFileTree);
                }
              }}
              className="p-1 px-2 bg-slate-400 text-xs rounded"
            >
              New File
            </button>
          </div>
          <div className="file-tree w-full flex-grow overflow-auto">
            {Object.keys(fileTree).length > 0 ? (
              Object.keys(fileTree).map((file, index) => (
                <div key={index} className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setCurrentFile(file);
                      setOpenFiles((prev) => [...new Set([...prev, file])]);
                    }}
                    className={`tree-element cursor-pointer p-2 px-4 flex items-center gap-2 w-full text-left ${
                      currentFile === file ? "bg-slate-400" : "bg-slate-300"
                    }`}
                  >
                    <p className="font-semibold">{file}</p>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${file}?`)) {
                        const newFileTree = { ...fileTree };
                        delete newFileTree[file];
                        setFileTree(newFileTree);
                        if (currentFile === file) {
                          setCurrentFile(Object.keys(newFileTree)[0] || null);
                        }
                        setOpenFiles((prev) => prev.filter((f) => f !== file));
                        saveFileTree(newFileTree);
                      }
                    }}
                    className="p-1 px-2 mr-1 text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500">No files available</div>
            )}
          </div>
        </div>

        <div className="code-editor flex flex-col flex-grow h-full shrink">
          <div className="top flex justify-between w-full">
            <div className="files flex overflow-x-auto">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 ${
                    currentFile === file ? "bg-slate-400" : "bg-slate-300"
                  }`}
                >
                  <p className="font-semibold text-lg">{file}</p>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenFiles((prev) => prev.filter((f) => f !== file));
                      if (currentFile === file) {
                        setCurrentFile(
                          openFiles.filter((f) => f !== file)[0] || null
                        );
                      }
                    }}
                    className="ml-2 text-gray-600 hover:text-red-600"
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>

            <div className="actions flex gap-2 items-center">
              <div className="container-status px-2 flex items-center">
                <span
                  className={`text-sm ${
                    containerStatus === "Ready"
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {containerStatus}
                </span>
              </div>
              <button
                onClick={runProject}
                disabled={isLoading || containerStatus !== "Ready"}
                className={`p-2 px-4 ${
                  isLoading || containerStatus !== "Ready"
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 cursor-pointer text-white"
                }`}
              >
                {isLoading ? "Running..." : "Run"}
              </button>
            </div>
          </div>
          <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
            {currentFile && fileTree[currentFile] ? (
              <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                <pre className="hljs h-full">
                  <code
                    className={`hljs h-full outline-none language-${getLanguageFromFilename(
                      currentFile
                    )}`}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText;
                      const ft = {
                        ...fileTree,
                        [currentFile]: {
                          file: {
                            contents: updatedContent,
                          },
                        },
                      };
                      setFileTree(ft);
                      saveFileTree(ft);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(
                        getLanguageFromFilename(currentFile),
                        getFileContents(currentFile)
                      ).value,
                    }}
                    style={{
                      whiteSpace: "pre-wrap",
                      paddingBottom: "25rem",
                      counterSet: "line-numbering",
                    }}
                  />
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-slate-50 text-gray-500">
                {Object.keys(fileTree).length > 0
                  ? "Select a file to edit"
                  : "No files available"}
              </div>
            )}
          </div>
        </div>

        {webContainer && (
          <div className="flex min-w-96 flex-col h-full">
            <div className="address-bar bg-slate-800 p-2">
              <div className="flex items-center">
                <input
                  type="text"
                  value={iframeUrl || ""}
                  className="w-full p-2 px-4 bg-slate-200 rounded-l"
                  placeholder="URL will appear when server is ready"
                  readOnly
                />
                <button
                  onClick={() => {
                    if (iframeUrl) {
                      // Create a new iframe URL with a timestamp to force refresh
                      setIframeUrl(
                        `${iframeUrl.split("?")[0]}?t=${Date.now()}`
                      );
                    }
                  }}
                  className="bg-slate-600 text-white p-2 px-4 rounded-r hover:bg-slate-700"
                  disabled={!iframeUrl}
                >
                  <i className="ri-refresh-line"></i>
                </button>
              </div>
            </div>
            <div className="preview-container relative flex-grow">
              {iframeUrl ? (
                <iframe
                  src={iframeUrl}
                  className="w-full h-full border-none"
                  title="WebContainer Preview"
                  sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                  {isLoading
                    ? "Starting server..."
                    : "Run the project to see preview"}
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="bg-white p-4 rounded-md shadow-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-center">Starting server...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {statusMessage && (
          <div className="status-message fixed bottom-4 right-4 bg-slate-800 text-white p-2 px-4 rounded-md shadow-lg z-50">
            {statusMessage}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.length > 0 ? (
                users.map((user, idx) => (
                  <div
                    key={idx}
                    className={`user cursor-pointer hover:bg-slate-200 ${
                      Array.from(selectedUserId).indexOf(user._id) !== -1
                        ? "bg-slate-200"
                        : ""
                    } p-2 flex gap-2 items-center`}
                    onClick={() => handleUserClick(user._id)}
                  >
                    <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                      <i className="ri-user-fill absolute"></i>
                    </div>
                    <h1 className="font-semibold text-lg">{user.email}</h1>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No users available
                </div>
              )}
            </div>
            <button
              onClick={addCollaborators}
              disabled={selectedUserId.size === 0}
              className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 ${
                selectedUserId.size === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white rounded-md`}
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
