import React from "react";

function CreateAssignment({ onCreate }) {
  return (
    <div>
      <h1>Hello, world!</h1>
      <button onClick={onCreate} type="submit">
        Create
      </button>
    </div>
  );
}

export default CreateAssignment;