import React from "react";
import { useMutateCourseSetup } from "../../../common/api";

export default function Dummy({ courseId }) {
  const mutations = [
    useMutateCourseSetup(courseId, "create-homepage"),
    useMutateCourseSetup(courseId, "publish-course"),
    useMutateCourseSetup(courseId, "create-assignment"),
    useMutateCourseSetup(courseId, "publish-assignment"),
  ];

  return (
    <table>
      <thead>
        <tr>
          <td />
          <td />
          <td>Loading?</td>
          <td>Success?</td>
          <td>Error?</td>
        </tr>
      </thead>
      <tbody>
        {mutations.map((m, i) => (
          <tr>
            <td>{i}</td>
            <td>
              <button
                className="rounded bg-blue-500 text-white py-1 px-4"
                onClick={() => m.mutate()}
                type="button"
              >
                Do!
              </button>
            </td>
            <td>{m.isLoading ? "yes" : "no"}</td>
            <td>{m.isSuccess ? "yes" : "no"}</td>
            <td>{m.isError ? "yes" : "no"}</td>
            <td>{m.error?.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
