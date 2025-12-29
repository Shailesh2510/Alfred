import { useMediaQuery } from "@mantine/hooks";

const useBreakPoints = () => {
  const matchesXxl = useMediaQuery("(min-width: 1600px)");
  const matchesXl = useMediaQuery("(min-width: 1408px) and (max-width: 1600px)");
  const matchesLg = useMediaQuery("(min-width: 1200px) and (max-width: 1408px)");
  const matchesMd = useMediaQuery("(min-width: 992px) and (max-width: 1200px)");
  const matchesSm = useMediaQuery("(min-width: 768px) and (max-width: 992px)");
  const matchesXs = useMediaQuery("(max-width: 576px)");

  const xxl = useMediaQuery("(max-width: 1600px)");
  const xl = useMediaQuery("(max-width: 1408px)");
  const lg = useMediaQuery("(max-width: 1200px)");
  const md = useMediaQuery("(max-width: 992px)");
  const sm = useMediaQuery("(max-width: 768px)");
  const xs = useMediaQuery("(max-width: 576px)");

  return { xs, sm, md, lg, xl, xxl, matchesXxl, matchesXl, matchesLg, matchesMd, matchesSm, matchesXs };
};

export default useBreakPoints;
