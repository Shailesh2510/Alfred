const getFontSize = (size: number) => {
  return `${size / 16}rem !important`;
};

const typography = {
  xxs500: {
    fontWeight: "500",
    fontSize: getFontSize(12),
    lineHeight: "155%",
  },
  xxs600: {
    fontWeight: "600",
    fontSize: getFontSize(12),
    lineHeight: "155%",
  },
  xs400: {
    fontWeight: "400",
    fontSize: getFontSize(13),
    lineHeight: "155%",
  },
  xs700: {
    fontWeight: "700",
    fontSize: getFontSize(13),
    lineHeight: "155%",
  },
  sm400: {
    fontWeight: "400",
    fontSize: getFontSize(14),
    lineHeight: "155%",
  },
  sm500: {
    fontWeight: "500",
    fontSize: getFontSize(14),
    lineHeight: "155%",
  },
  sm600: {
    fontWeight: "600",
    fontSize: getFontSize(14),
    lineHeight: "155%",
  },
  sm700: {
    fontWeight: "700",
    fontSize: getFontSize(14),
    lineHeight: "155%",
  },
  md400: {
    fontWeight: "400",
    fontSize: getFontSize(16),
    lineHeight: "155%",
  },
  md500: {
    fontWeight: "500",
    fontSize: getFontSize(16),
    lineHeight: "155%",
  },
  md600: {
    fontWeight: "600",
    fontSize: getFontSize(16),
    lineHeight: "155%",
  },
  md700: {
    fontWeight: "700",
    fontSize: getFontSize(16),
    lineHeight: "155%",
  },
  lg400: {
    fontWeight: "400",
    fontSize: getFontSize(18),
    lineHeight: "155%",
  },
  lg600: {
    fontWeight: "600",
    fontSize: getFontSize(18),
    lineHeight: "155%",
  },
  lg700: {
    fontWeight: "700",
    fontSize: getFontSize(18),
    lineHeight: "155%",
  },
  xl300: {
    fontWeight: "300",
    fontSize: getFontSize(20),
    lineHeight: "155%",
  },
  xxl400: {
    fontWeight: "400",
    fontSize: getFontSize(24),
    lineHeight: "155%",
  },
  xxl700: {
    fontWeight: "700",
    fontSize: getFontSize(24),
    lineHeight: "155%",
  },
  headings: {
    h1: {
      fontWeight: "700",
      fontSize: getFontSize(36),
      lineHeight: "1.3",
    },
    h2: {
      fontWeight: "700",
      fontSize: getFontSize(26),
      lineHeight: "1.35",
    },
    h3: {
      fontWeight: "700",
      fontSize: getFontSize(22),
      lineHeight: "1.4",
    },
    h4: {
      fontWeight: "700",
      fontSize: getFontSize(18),
      lineHeight: "1.45",
    },
    h5: {
      fontWeight: "700",
      fontSize: getFontSize(16),
      lineHeight: "1.5",
    },
    h6: {
      fontWeight: "700",
      fontSize: getFontSize(14),
      lineHeight: "1.5",
    },
  },
};

export default typography;
