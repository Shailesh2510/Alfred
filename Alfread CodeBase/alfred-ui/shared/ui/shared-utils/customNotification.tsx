import React from "react";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";

const customNotification: any = {
  success({ title, message, ...props }: any) {
    notifications.show({
      title,
      message,
      color: "green.5",
      ...props,
    });
  },
  error({ title, message, ...props }: any) {
    notifications.show({
      title,
      message,
      color: "red.5",
      ...props,
      icon: <IconX />,
    });
  },
  info({ title, message, ...props }: any) {
    notifications.show({
      title,
      message,
      color: "indigo.5",
      ...props,
    });
  },
};

export default customNotification;
