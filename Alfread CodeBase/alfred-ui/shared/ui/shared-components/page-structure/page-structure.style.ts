import styled from "@emotion/styled";
import { colors, typography } from "@/design-system";

export const PageStructureContainer: any = styled.div`
  display: flex;
  background: white;
  flex-direction: column;
  min-height: calc(100vh - 70px);
`;

export const PageStructureBody: any = styled.div`
  flex-grow: 1;
  overflow-x: scroll;
  background: white;
`;

export const PageStructureHeader: any = styled.div`
  padding: 16px 24px;
  box-shadow: 0px 1px 0px ${colors.gray[0]};
  border-bottom: 1px solid ${colors.gray[5]};
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PageStructureHeaderTitle: any = styled.div`
  ${typography.headings.h1};
`;

export const PageStructureHeaderContent: any = styled.div`
  display: flex;
  align-items: center;
  ${typography.headings.h1};
`;

export const PageStructureSubHeaderContent: any = styled.div`
  display: flex;
  align-items: center;
  ${typography.headings.h1};
  width: 100%;
`;

export const PageStructureFooter: any = styled.div``;
