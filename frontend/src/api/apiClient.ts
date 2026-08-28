const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api";

type RequestOptions = RequestInit & {
  token?: string;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(
    options.headers,
  );

  headers.set(
    "Accept",
    "application/json",
  );

  if (options.body) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (options.token) {
    headers.set(
      "Authorization",
      `Bearer ${options.token}`,
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    },
  );

  if (!response.ok) {
    let message =
      `API request failed (${response.status})`;

    try {
      const error = await response.json();

      if (
        typeof error?.detail === "string"
      ) {
        message = error.detail;
      } else if (
        error?.detail?.message &&
        typeof error.detail.message === "string"
      ) {
        message = error.detail.message;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  // --------------------------------------------------
  // Health
  // --------------------------------------------------

  health() {
    return request("/health");
  },

  // --------------------------------------------------
  // Curriculum
  // --------------------------------------------------

  getGrades() {
    return request("/grades");
  },

  getTerms(gradeId: number) {
    return request(
      `/grades/${gradeId}/terms`,
    );
  },

  getSubjects(termId: number) {
    return request(
      `/terms/${termId}/subjects`,
    );
  },

  getSubject(subjectId: number) {
    return request(
      `/subjects/${subjectId}`,
    );
  },

  getUnits(subjectId: number) {
    return request(
      `/subjects/${subjectId}/units`,
    );
  },

  getLessons(unitId: number) {
    return request(
      `/units/${unitId}/lessons`,
    );
  },

  getLesson(lessonId: number) {
    return request(
      `/lessons/${lessonId}`,
    );
  },

  // --------------------------------------------------
  // Lesson Content
  // --------------------------------------------------

  getLessonContent(lessonId: number) {
    return request(
      `/lessons/${lessonId}/content`,
    );
  },

  getLessonAssets(lessonId: number) {
    return request(
      `/lessons/${lessonId}/assets`,
    );
  },

  // --------------------------------------------------
  // Questions
  // --------------------------------------------------

  getLessonQuestions(lessonId: number) {
    return request(
      `/lessons/${lessonId}/questions`,
    );
  },

  getQuestion(questionId: string) {
    return request(
      `/questions/${encodeURIComponent(
        questionId,
      )}`,
    );
  },

  // --------------------------------------------------
  // Student
  // --------------------------------------------------

  getStudent(
    studentProfileId: string,
    token: string,
  ) {
    return request(
      `/students/${encodeURIComponent(
        studentProfileId,
      )}`,
      {
        token,
      },
    );
  },

  getStudentProgress(
    studentProfileId: string,
    token: string,
  ) {
    return request(
      `/students/${encodeURIComponent(
        studentProfileId,
      )}/progress`,
      {
        token,
      },
    );
  },

  getStudentAnalytics(
    studentProfileId: string,
    token: string,
  ) {
    return request(
      `/students/${encodeURIComponent(
        studentProfileId,
      )}/analytics`,
      {
        token,
      },
    );
  },

  // --------------------------------------------------
  // Parent Invitations
  // --------------------------------------------------

  createParentInvitation(
    studentProfileId: string,
    token: string,
  ) {
    return request(
      `/parent/invitations?student_profile_id=${encodeURIComponent(
        studentProfileId,
      )}`,
      {
        method: "POST",
        token,
      },
    );
  },

  claimParentInvitation(
    code: string,
    token: string,
  ) {
    return request(
      `/parent/invitations/${encodeURIComponent(
        code,
      )}/claim`,
      {
        method: "POST",
        token,
      },
    );
  },
};