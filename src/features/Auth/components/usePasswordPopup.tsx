// usePasswordPopup.tsx
import ReactDOM from "react-dom/client";
import React from "react";
import PasswordPopup from "./PasswordPopup";

export function showPasswordPopup(photoURL: string): Promise<string | null> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(
      <PasswordPopup
        photoURL={photoURL}
        resolve={(password) => {
          root.unmount();
          container.remove();
          resolve(password);
        }}
      />
    );
  });
}
