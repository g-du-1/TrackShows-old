import React from "react";

export default function Spinner() {
  return (
    <div className="mt-3">
      <div className="d-flex align-items-center justify-content-center mx-auto my-auto">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
}
