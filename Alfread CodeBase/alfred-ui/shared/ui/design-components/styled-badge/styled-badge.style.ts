import styled from "@emotion/styled";
import { Badge } from "@mantine/core";
import { typography } from "@/design-system";
import { css } from "@emotion/react";

const StyledBadgeComponent: any = styled(Badge)<{ font: string }>`
  text-transform: capitalize;
  ${({ font }) => (typography as any)[font]};
  ${({ showPointer }: any) =>
    showPointer
      ? css`
          cursor: pointer;
        `
      : null};
`;

export default StyledBadgeComponent;
