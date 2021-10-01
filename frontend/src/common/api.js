import { useMutation, useQuery, useQueryClient } from "react-query";
import { assert } from "./utils";

const PROGRESS_REFRESH_INTERVAL = 3000;

export class ApiError extends Error {
  constructor({ type, statusCode, message, details }) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function apiClient(endpoint, { method, body } = {}) {
  const config = {
    method: method || "GET",
  };

  // Add body and headers to request if needed
  if (body !== undefined) {
    assert(
      ["POST", "PUT"].indexOf(method) >= 0,
      "Param body can only be sent with POST or PUT requests"
    );
    config.body = JSON.stringify(body);
    config.headers = {
      "Content-Type": "application/json",
    };
  }

  const response = await window.fetch(`/scanned-exams/api/${endpoint}`, config);
  const data = await response.json();

  if (!response.ok || data.error) {
    if (typeof data.error === "object") {
      // Throw API specific errors
      throw new ApiError({
        ...data.error, // Apply the error object as is (see error.js in backend)
      });
    } else {
      // Throw general errors
      throw new Error(data.message);
    }
  }

  return data;
}

/** Fetches the API to get information about the setup of a given course */
export function useCourseSetup(courseId) {
  return useQuery(["course", courseId, "setup"], () =>
    apiClient(`courses/${courseId}/setup`)
  );
}

/** Fetches the API to get information about the setup of a given course */
export function useCourseImportStatus(courseId, options = {}) {
  return useQuery(
    ["course", courseId, "import", "status"],
    () => apiClient(`courses/${courseId}/import/status`),
    {
      onSuccess({ status } = {}) {
        options.onSuccess?.(status);
      },
      // We are refetching this periodically so UX changes state if
      // import queue is triggered somewhere else
      refetchInterval: PROGRESS_REFRESH_INTERVAL * 10,
    }
  );
}

/** Ping API on import progress */
export function useCourseImportProgress(courseId, options = {}) {
  return useQuery(
    ["course", courseId, "import", "status", "ping"],
    () => apiClient(`courses/${courseId}/import/status`),
    {
      refetchInterval: options.cancel ? false : PROGRESS_REFRESH_INTERVAL,
      ...options,
    }
  );
}

/** Fetches the API to get information about the exams of a given course */
export function useCourseExams(courseId) {
  return useQuery(["course", courseId, "exams"], () =>
    apiClient(`courses/${courseId}/exams`)
  );
}

export function useMutateExamroomSetup(courseId, options = {}) {
  const client = useQueryClient();

  return useMutation(
    async (setRecommendedHomepage = false) => {
      if (setRecommendedHomepage) {
        await apiClient(`courses/${courseId}/setup/create-homepage`, {
          method: "POST",
        });
      }

      return apiClient(`courses/${courseId}/setup/create-assignment`, {
        method: "POST",
      });
    },
    {
      ...options,
      onSuccess() {
        client.invalidateQueries(["course", courseId, "setup"]);
      },
    }
  );
}

export function useMutatePublishAll(courseId, options = {}) {
  const client = useQueryClient();

  return useMutation(
    async () => {
      await apiClient(`courses/${courseId}/setup/publish-course`, {
        method: "POST",
      });
      await apiClient(`courses/${courseId}/setup/publish-assignment`, {
        method: "POST",
      });
    },
    {
      ...options,
      onSuccess() {
        client.resetQueries(["course", courseId]);
        client.invalidateQueries(["course", courseId, "setup"]);
      },
    }
  );
}

/** Performs one action to change the setup of a course */
export function useMutateCourseSetup(courseId, action, options = {}) {
  const client = useQueryClient();

  return useMutation(
    () =>
      apiClient(`courses/${courseId}/setup/${action}`, {
        method: "POST",
      }),
    {
      ...options,
      onSuccess() {
        if (action === "publish-assignment") {
          // Reset queries to trigger loading indicator when
          // moving to imoport flow
          client.resetQueries(["course", courseId]);
        } else {
          client.invalidateQueries(["course", courseId, "setup"]);
        }
        options.onSuccess?.();
      },
    }
  );
}

/** Start an import */
export function useMutateImportStart(courseId, examsToImport, options = {}) {
  const client = useQueryClient();

  return useMutation(
    () =>
      apiClient(`courses/${courseId}/import/start`, {
        method: "POST",
        body: examsToImport.map((exam) => exam.id),
      }),
    {
      ...options,
      // Passes status object from API as data to callback
      onSuccess(data) {
        client.invalidateQueries(["course", courseId, "setup"]);
        options.onSuccess?.(data);
      },
    }
  );
}

/** Add Students to Course */
export function useMutateAddStudents(courseId, studentIds, options = {}) {
  const client = useQueryClient();

  return useMutation(
    () =>
      apiClient(`courses/${courseId}/students`, {
        method: "POST",
        body: studentIds,
      }),
    {
      ...options,
      // Passes status object from API as data to callback
      onSuccess(data) {
        client.invalidateQueries(["course", courseId, "setup"]);
        options.onSuccess?.(data);
      },
    }
  );
}

/**
 * Fetches the API to get information about the current user.
 *
 * If the user is logged out, field "data" will be null
 */
export function useUser() {
  return useQuery("user", () =>
    apiClient(`me`).catch((err) => {
      if (err instanceof ApiError && err.statusCode === 404) {
        return null;
      }

      throw err;
    })
  );
}
