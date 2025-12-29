import styled from "@emotion/styled";
import { Table } from "@mantine/core";
import { colors, typography } from "@/design-system";

export const StyledTableComponent: any = styled(Table)`
  thead {
    height: 52px;
    color: ${colors.gray[6]};
    background: ${colors.gray[0]};
  }
  thead tr {
    color: ${colors.gray[1]};
  }
  th {
    padding: 16px 24px !important;
    ${typography.md700};
    color: ${colors.gray[6]} !important;
  }
  tr {
    border-bottom: 1px solid ${colors.gray[4]} !important;
  }
  td {
    padding: 16px 24px !important;
    color: ${colors.dark[5]} !important;
    ${typography.md400};
    b {
      ${typography.md600};
    }
  }
`;

export default StyledTableComponent;
