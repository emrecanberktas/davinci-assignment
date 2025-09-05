import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./Modal";
import UserForm from "./UserForm";
import PostForm from "./PostForm";
import ConfirmDialog from "./ConfirmDialog";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface Post {
  userId: number;
  id: number;
  title: string;
}

function Homepage() {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "posts">("users");

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteItem, setDeleteItem] = useState<{
    type: "user" | "post";
    id: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersResponse, postsResponse] = await Promise.all([
          axios.get("https://jsonplaceholder.typicode.com/users"),
          axios.get("https://jsonplaceholder.typicode.com/posts"),
        ]);

        setUsers(usersResponse.data);
        setPosts(postsResponse.data);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  const getUserPostsCount = (userId: number) => {
    return posts.filter((post) => post.userId === userId).length;
  };

  const handleCreateUser = async (userData: Omit<User, "id">) => {
    setIsSubmitting(true);
    try {
      const newUser: User = {
        ...userData,
        id: Math.max(...users.map((u) => u.id), 0) + 1,
      };
      setUsers((prev) => [...prev, newUser]);
      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (userData: Omit<User, "id">) => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const updatedUser: User = {
        ...userData,
        id: editingUser.id,
      };
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? updatedUser : u))
      );
      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteItem) return;

    setIsSubmitting(true);
    try {
      setUsers((prev) => prev.filter((u) => u.id !== deleteItem.id));
      setPosts((prev) => prev.filter((p) => p.userId !== deleteItem.id));
      setIsConfirmDialogOpen(false);
      setDeleteItem(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePost = async (postData: Omit<Post, "id">) => {
    setIsSubmitting(true);
    try {
      const newPost: Post = {
        ...postData,
        id: Math.max(...posts.map((p) => p.id), 0) + 1,
      };
      setPosts((prev) => [...prev, newPost]);
      setIsPostModalOpen(false);
      setEditingPost(null);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePost = async (postData: Omit<Post, "id">) => {
    if (!editingPost) return;

    setIsSubmitting(true);
    try {
      const updatedPost: Post = {
        ...postData,
        id: editingPost.id,
      };
      setPosts((prev) =>
        prev.map((p) => (p.id === editingPost.id ? updatedPost : p))
      );
      setIsPostModalOpen(false);
      setEditingPost(null);
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!deleteItem) return;

    setIsSubmitting(true);
    try {
      setPosts((prev) => prev.filter((p) => p.id !== deleteItem.id));
      setIsConfirmDialogOpen(false);
      setDeleteItem(null);
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUserModal = (user?: User) => {
    setEditingUser(user || null);
    setIsUserModalOpen(true);
  };

  const openPostModal = (post?: Post) => {
    setEditingPost(post || null);
    setIsPostModalOpen(true);
  };

  const openDeleteDialog = (type: "user" | "post", id: number) => {
    setDeleteItem({ type, id });
    setIsConfirmDialogOpen(true);
  };

  const closeModals = () => {
    setIsUserModalOpen(false);
    setIsPostModalOpen(false);
    setIsConfirmDialogOpen(false);
    setEditingUser(null);
    setEditingPost(null);
    setDeleteItem(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-700">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-700 text-center">
          <h2 className="text-3xl mb-4 font-bold">⚠️ Error</h2>
          <p className="text-lg mb-8 text-gray-600">{error}</p>
          <button
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-2 text-gray-800">
          User Management Dashboard
        </h1>
      </header>

      <div className="flex justify-between items-center mb-8 gap-8 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-lg text-base bg-white shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl text-gray-400">
            🔍
          </span>
        </div>

        <div className="flex gap-2">
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "users"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users ({filteredUsers.length})
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === "posts"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            Posts ({filteredPosts.length})
          </button>
        </div>
      </div>

      <main className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 min-h-[500px]">
        {activeTab === "users" ? (
          <div>
            <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-100">
              <h2 className="text-3xl font-semibold text-gray-800">Users</h2>
              <button
                onClick={() => openUserModal()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                + Add User
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="w-15 h-15 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {user.name}
                    </h3>
                    <p className="text-gray-600 font-medium mb-1">
                      @{user.username}
                    </p>
                    <p className="text-gray-500 text-sm break-all mb-1">
                      {user.email}
                    </p>
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <p className="text-blue-700 text-sm font-medium">
                        📝 {getUserPostsCount(user.id)} posts
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openUserModal(user)}
                      className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-all duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteDialog("user", user.id)}
                      className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-all duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-100">
              <h2 className="text-3xl font-semibold text-gray-800">Posts</h2>
              <button
                onClick={() => openPostModal()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                + Add Post
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-4 gap-4">
                    {/* Tailwind break all ihtiyaç durumunda kelime bitmese dahi kelimeyi kırar*/}
                    <h3 className="text-xl font-semibold text-gray-800 flex-1 leading-relaxed break-all">
                      {post.title.length > 50
                        ? post.title.slice(0, 50) + "..."
                        : post.title}
                    </h3>
                    <div className="flex flex-col items-end gap-2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                        by {getUserName(post.userId)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openPostModal(post)}
                      className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-all duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteDialog("post", post.id)}
                      className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-all duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Modal
        isOpen={isUserModalOpen}
        onClose={closeModals}
        title={editingUser ? "Edit User" : "Add New User"}
      >
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onCancel={closeModals}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isPostModalOpen}
        onClose={closeModals}
        title={editingPost ? "Edit Post" : "Add New Post"}
      >
        <PostForm
          post={editingPost}
          users={users}
          onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
          onCancel={closeModals}
          isLoading={isSubmitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={closeModals}
        onConfirm={
          deleteItem?.type === "user" ? handleDeleteUser : handleDeletePost
        }
        title={`Delete ${deleteItem?.type === "user" ? "User" : "Post"}`}
        message={
          deleteItem?.type === "user"
            ? `Are you sure you want to delete this user? This will also delete all posts by this user. This action cannot be undone.`
            : `Are you sure you want to delete this post? This action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isSubmitting}
        type="danger"
      />
    </div>
  );
}

export default Homepage;
