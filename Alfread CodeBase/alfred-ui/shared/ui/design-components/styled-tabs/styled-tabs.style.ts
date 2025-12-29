import styled from "@emotion/styled";
import { Tabs } from "@mantine/core";
import { colors } from "@/design-system";

export const StyledTabsComponent: any = styled(Tabs)<{ active: boolean }>`
  .mantine-Tabs-root {
    padding-top: 14px;
    height: 100%;
  }
  .mantine-Tabs-panel {
    padding: 0;
    height: 100%;
  }
  .mantine-Tabs-tabsList {
    height: 86px;
    padding-top: 14px;
    padding-left: 24px;
    background: ${colors.gray[0]};
  }
`;

export default StyledTabsComponent;
