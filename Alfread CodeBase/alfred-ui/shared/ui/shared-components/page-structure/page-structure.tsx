import React from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import {
  PageStructureBody,
  PageStructureHeader,
  PageStructureContainer,
  PageStructureHeaderTitle,
  PageStructureHeaderContent,
  PageStructureSubHeaderContent,
  PageStructureFooter,
} from "./page-structure.style";
import { useRouter } from "next/router";
import { ActionIcon, Flex } from "@mantine/core";

const PageStructure = ({
  title,
  headerContent,
  subHeaderContent,
  pageContent,
  footerContent,
  goBack = false,
  handleGoBack,
}: any) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (handleGoBack) {
      handleGoBack();
    } else {
      router.back();
    }
  };

  return (
    <PageStructureContainer>
      {(title || headerContent) && (
        <Flex align="center" justify="space-between" gap={20}>
          <PageStructureHeader>
            <Flex align="center" justify="space-between" gap={20}>
              <Flex align="center" justify="flex-start" gap={20}>
                {goBack ? (
                  <ActionIcon color="gray.9">
                    <IconArrowLeft onClick={handleBackClick} />
                  </ActionIcon>
                ) : null}
                {title && <PageStructureHeaderTitle>{title}</PageStructureHeaderTitle>}
              </Flex>
              {headerContent && <PageStructureHeaderContent>{headerContent}</PageStructureHeaderContent>}
            </Flex>
            {subHeaderContent && <PageStructureSubHeaderContent>{subHeaderContent}</PageStructureSubHeaderContent>}
          </PageStructureHeader>
        </Flex>
      )}
      <PageStructureBody>{pageContent}</PageStructureBody>
      <PageStructureFooter>{footerContent}</PageStructureFooter>
    </PageStructureContainer>
  );
};
export default PageStructure;
