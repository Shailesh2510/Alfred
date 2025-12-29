import styled from "@emotion/styled";
import { Select } from "@mantine/core";
import { colors, typography } from "@/design-system";

const StyledSelectComponent: any = styled(Select)`
  .mantine-Select-item {
    border-radius: 4px;
    ${typography.sm400};
    color: ${colors.gray[9]};
  }
  .mantine-Select-item:hover {
    ${typography.sm400};
    color: ${colors.gray[9]};
    background-color: ${colors.gray[0]};
  }
  .mantine-Select-item[data-selected="true"] {
    ${typography.sm400};
    color: ${colors.primary[9]};
    background-color: ${colors.primary[0]};
  }
  .mantine-Select-input {
    border-radius: 4px;
    ${typography.sm400};
    color: ${colors.gray[9]};
  }
  input::placeholder {
    ${typography.sm400};
    color: ${colors.gray[6]};
  }
`;

export default StyledSelectComponent;
