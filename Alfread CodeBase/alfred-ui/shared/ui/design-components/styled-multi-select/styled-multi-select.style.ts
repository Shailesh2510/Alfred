import styled from "@emotion/styled";
import { MultiSelect } from "@mantine/core";
import { colors, typography } from "@/design-system";

const StyledMultiSelect: any = styled(MultiSelect)`
  .mantine-MultiSelect-label {
    margin-bottom: 4px;
    ${typography.sm500};
  }
  .mantine-MultiSelect-required {
    color: ${colors.red[6]};
    ${typography.sm500};
  }
  .mantine-MultiSelect-input {
    border-radius: 4px !important;
    ${typography.sm500};
    color: ${colors.gray[9]};
  }
  input::placeholder {
    color: ${colors.gray[5]};
    ${typography.sm500};
  }
  .mantine-MultiSelect-item {
    ${typography.sm500};
    color: ${colors.dark[6]};
  }
  .mantine-MultiSelect-item[data-disabled="true"] {
    color: ${colors.dark[1]};
  }
  .mantine-MultiSelect-item[data-disabled="true"]:hover {
    color: ${colors.dark[1]};
  }
  .mantine-MultiSelect-item:hover {
    ${typography.sm500};
    color: ${colors.dark[6]};
    background-color: ${colors.gray[1]};
  }
  .mantine-MultiSelect-input {
    border-radius: 2px;
  }
`;

export default StyledMultiSelect;
