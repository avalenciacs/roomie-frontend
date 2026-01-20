import api from "./api";

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  // POST /api/uploads/image
  const res = await api.post("/api/uploads/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.imageUrl;
}
