import styled from "@emotion/styled";
import { TextInput } from "@mantine/core";
import { colors, typography } from "@/design-system";

const StyledSearchComponent: any = styled(TextInput)`
  ${typography.md400};
  color: ${colors.gray[6]};
  .mantine-TextInput-input {
    border: 1px solid ${colors.dark[0]};
  }
`;

export default StyledSearchComponent;
