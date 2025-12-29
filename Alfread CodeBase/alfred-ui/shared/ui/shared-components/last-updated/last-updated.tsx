import React, { useEffect, useState } from "react";
import { IconReload } from "@tabler/icons-react";
import { LastUpdatedText } from "./last-updated.style";
import { calculateTimeAgo } from "../../shared-utils";
import { StyledButton } from "../../design-components";
import { Flex } from "@mantine/core";

const LastUpdatedAgo = (props: any) => {
  const [_, setTrigger] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTrigger((prev) => prev + 1);
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Flex m={8}>
      <LastUpdatedText>{`Last updated : ${calculateTimeAgo(props.lastUpdatedTime)}`}</LastUpdatedText>
      <StyledButton size="xs" variant="light" onClick={() => props.refetchOnClick()} sx={{ marginLeft: "8px" }}>
        <IconReload size={20} />
      </StyledButton>
    </Flex>
  );
};

export default LastUpdatedAgo;
