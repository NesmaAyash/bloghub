import apiClient from './api.client';

export const authorService = {
  uploadAvatar: async (userId: string | number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `/Author/${userId}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: [(data) => data], // ← مهم! يمنع axios من تحويل الـ FormData لـ JSON
      }
    );
    return response.data;
  },
};