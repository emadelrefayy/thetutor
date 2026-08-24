// API Client لربط الفرونت إند بالباك إند المحلي (FastAPI على بورت 8000)
const API_BASE_URL = "http://localhost:8000/api";

export const apiClient = {
  async getSubjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects`);
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || "Failed to fetch subjects");
    } catch (error) {
      console.error("API Error (getSubjects):", error);
      return [];
    }
  },

  async getLessons(subjectId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/lessons/${subjectId}`);
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || "Failed to fetch lessons");
    } catch (error) {
      console.error(`API Error (getLessons for subject ${subjectId}):`, error);
      return [];
    }
  }
};
