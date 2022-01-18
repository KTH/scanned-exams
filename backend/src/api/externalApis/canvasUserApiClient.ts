/**
 * Instantiable Canvas API Client
 *
 * Instead of using a fixed API Token, this client is built with an API Token.
 * That way you can make queries on behalf of that token instead of an "admin"
 * token.
 *
 * It also defines Types for the responses from Canvas so they can be
 * more predictable
 */
import Canvas from "@kth/canvas-api";

interface Enrollment {
  role_id: number;
}

export default class CanvasUserApiClient {
  client: Canvas;

  constructor(apiToken: string) {
    this.client = new Canvas(process.env.CANVAS_API_URL, apiToken);
  }

  /** Get which roles have the current user in a given course */
  async getRoles(courseId: string) {
    const enrollments = await this.client
      .listItems<Enrollment>(`courses/${courseId}/enrollments`)
      .toArray();

    return enrollments.map((e) => e.role_id);
  }
}
