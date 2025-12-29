import styled from "@emotion/styled";
import { colors, typography } from "@/design-system";

export const StyledContainer: any = styled.div`
  padding: 24px 16px 16px 16px;
  min-height: 50px;
  position: relative;
  border-radius: 8px;
  border: 1px solid ${colors.dark[0]};
`;

export const StyledTitle: any = styled.div`
  top: -12px;
  left: 20px;
  z-index: 2;
  padding: 0 10px;
  position: absolute;
  background: ${colors.white};
  text-transform: uppercase;
  color: ${colors.gray[6]};
  ${typography.sm700};
`;
