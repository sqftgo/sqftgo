"use client";

import { Toaster as HotToaster } from "react-hot-toast";

/** Global top-right toast host (react-hot-toast). */
export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      toastOptions={{
        duration: 4200,
        className: "text-xs font-semibold !rounded-2xl !px-4 !py-3 !shadow-xl",
        style: {
          maxWidth: "22rem",
        },
      }}
      containerStyle={{
        top: 16,
        right: 16,
      }}
    />
  );
}

export default Toaster;
