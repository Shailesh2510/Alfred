import styled from "@emotion/styled";
import { Tabs } from "@mantine/core";
import { typography } from "@/design-system";

export const StyledTab: any = styled(Tabs.Tab)<{ active: boolean }>`
  height: 72px;
  padding: 16px;
  min-width: 170px;
  &[data-active="true"] {
    color: black;
    background: white;
    ${typography.md600};
  }
`;

export default StyledTab;
