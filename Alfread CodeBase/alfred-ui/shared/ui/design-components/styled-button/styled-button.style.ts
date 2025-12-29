import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Button } from "@mantine/core";
import { typography } from "@/design-system";

const StyledButtonComponent: any = styled(Button)<{ variant: string; font: any }>`
  padding: 4px 10px;
  ${({ font }) => (typography as any)[font]};
  ${(props) =>
    props.variant === "outline"
      ? css`
          background: white;
        `
      : null}
`;

export default StyledButtonComponent;
