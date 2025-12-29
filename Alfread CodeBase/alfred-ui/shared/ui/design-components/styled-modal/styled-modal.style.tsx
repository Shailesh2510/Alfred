import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Modal } from "@mantine/core";
import { colors, typography } from "@/design-system";
import { isMobile } from "react-device-detect";

export const StyledModalComponent: any = styled<any>(Modal)`
  .mantine-Modal-content {
    border-radius: 8px;
  }
  .mantine-Modal-body {
    position: relative;
    padding: 0px;
  }
  .mantine-Modal-title {
    color: ${colors.dark[6]};
    ${isMobile ? typography.headings.h4 : typography.headings.h2};
  }
  ${(props) =>
    !props.showHeader
      ? css`
          .mantine-Modal-header {
            display: none;
          }
        `
      : null}
`;

export const ModalBody: any = styled.div<any>`
  padding: 16px 16px 36px 16px;
  min-height: ${(props) => (props?.mih ? `${props?.mih}px` : null)};
`;

export const ModalFooter: any = styled.div`
  bottom: 0;
  z-index: 2;
  width: 100%;
  padding: 16px;
  position: sticky;
  background-color: ${colors.white};
  box-shadow: 0px -8px 16px rgba(0, 0, 0, 0.08);
`;
