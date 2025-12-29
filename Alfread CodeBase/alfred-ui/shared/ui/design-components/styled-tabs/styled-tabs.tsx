import React from 'react';
import StyledTabsComponent from "./styled-tabs.style";

const StyledTabs: any = ({children, ...props}: any) => {
  return <StyledTabsComponent {...props}>{children}</StyledTabsComponent>;
};

StyledTabs.displayName = 'Tabs'

export default StyledTabs;
