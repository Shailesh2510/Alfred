import React from "react";
import { Flex } from "@mantine/core";
import { IconReportSearch } from "@tabler/icons-react";
import { NoDataLabel } from "./no-data.style";

const NoData = ({
  message,
  height = "100%",
  minHeight,
}: {
  message: string;
  height?: number | string;
  minHeight?: number | string;
}) => {
  return (
    <Flex justify="center" align="center" w="100%" h={height} mih={minHeight} direction="column">
      <IconReportSearch size={60} color="#909296" />
      <NoDataLabel>{message}</NoDataLabel>
    </Flex>
  );
};

export default NoData;
