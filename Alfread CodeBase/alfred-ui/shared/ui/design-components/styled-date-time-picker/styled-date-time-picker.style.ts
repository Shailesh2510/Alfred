import styled from "@emotion/styled";
import { DateTimePicker } from "@mantine/dates";
import { colors, typography } from "@/design-system";

const StyledDateTimePickerContainer: any = styled(DateTimePicker)`
  .mantine-DateTimePicker-placeholder {
    color: ${colors.gray[6]};
    ${typography.sm400};
  }
  .mantine-DateTimePicker-input {
    border-radius: 4px;
    ${typography.sm400};
  }
`;

export default StyledDateTimePickerContainer;
