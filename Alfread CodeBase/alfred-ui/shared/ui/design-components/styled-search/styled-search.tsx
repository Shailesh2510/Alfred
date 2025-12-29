import React from "react";
import { IconSearch } from "@tabler/icons-react";
import StyledSearchComponent from "./styled-search.style";

const StyledSearch: any = (props: any) => {
  return <StyledSearchComponent radius={24} icon={<IconSearch />} {...props} />;
};

export default StyledSearch;
