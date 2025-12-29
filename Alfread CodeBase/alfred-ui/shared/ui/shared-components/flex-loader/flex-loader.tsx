import { Loader } from "@mantine/core";
import React from "react";

const FlexLoader = () => {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Loader color="gray" size="xl" />
    </div>
  );
};

export default FlexLoader;
