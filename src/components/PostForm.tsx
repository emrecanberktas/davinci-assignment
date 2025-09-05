import React, { useState, useEffect } from "react";

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

interface PostFormProps {
  post?: Post | null;
  users: User[];
  onSubmit: (postData: Omit<Post, "id">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({
  post,
  users,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    userId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        userId: post.userId || 0,
      });
    } else if (users.length > 0) {
      setFormData((prev) => ({ ...prev, userId: users[0].id }));
    }
  }, [post, users]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.userId) newErrors.userId = "Please select a user";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const postData = {
      title: formData.title.trim(),
      userId: formData.userId,
    };

    onSubmit(postData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "userId" ? parseInt(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Author *
        </label>
        <select
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          className={`w-full px-2 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.userId ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value={0}>Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} (@{user.username})
            </option>
          ))}
        </select>
        {errors.userId && (
          <p className="text-red-500 text-sm mt-1">{errors.userId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-2 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter post title"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-6 ">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <p className="font-semibold">
            {isLoading ? "Saving..." : post ? "Update Post" : "Create Post"}
          </p>
        </button>
      </div>
    </form>
  );
};

export default PostForm;
