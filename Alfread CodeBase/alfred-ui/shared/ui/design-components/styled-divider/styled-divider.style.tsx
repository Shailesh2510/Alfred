import styled from "@emotion/styled";
import { Divider } from "@mantine/core";
import { typography } from "@/design-system";

export const StyledDividerComponent: any = styled(Divider)<{ font: string }>`
  .mantine-Divider-label {
    ${(props) => (typography as any)[props.font]};
  }
`;
