import { useQuery } from "react-query";
import styled from "styled-components";
import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import { onAir, airingToday, popularTv, topRatedTv, IGetTvResult } from "./api";
import { makeImagePath } from "./utils";
import { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";

const Wrapper = styled.div`
  background: rgba(18, 18, 18, 1);
  height: 250vh;
  padding-bottom: 80px;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0vh 5vw;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(18, 18, 18, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 65px;
  margin-bottom: 25px;
`;

const Overview = styled.p`
  font-size: 28px;
  width: 50%;
`;

const TvSlider = styled.div`
  position: relative;
`;

const OnAir = styled.div<{ width: number }>`
  position: relative;
`;

const AiringToday = styled.div<{ width: number }>`
  position: relative;
  top: ${({ width }) => width / 8 + 80}px;
`;

const PoPularTv = styled.div<{ width: number }>`
  position: relative;
  top: ${({ width }) => width / 4 + 160}px;
`;

const TopRatedTv = styled.div<{ width: number }>`
  position: relative;
  top: ${({ width }) => width / 2.65 + 240}px;
`;

const Kind = styled.div``;

const LeftBtn = styled(motion.button)<{ width: number }>`
  z-index: 99;
  position: absolute;
  left: 0;
  top: -7vh;
  width: 4%;
  height: ${({ width }) => (width - (width / 100) * 8 - 30) / 8}px;
  font-size: 22px;
  font-weight: 600;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.04);
  border: none;
  color: white;
`;

const RightBtn = styled(motion.button)<{ width: number }>`
  z-index: 99;
  right: 0;
  top: -7vh;
  width: 4%;
  height: ${({ width }) => (width - (width / 100) * 8 - 30) / 8}px;
  position: absolute;
  font-size: 22px;
  font-weight: 600;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.04);
  border: none;
  color: white;
`;

const Type = styled.div`
  top: -11vh;
  left: 4vw;
  position: absolute;
  font-size: 22px;
  font-weight: 600;
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  top: -7vh;
  padding: 0 4vw 0 4vw;
  grid-template-columns: repeat(5, 1fr);
  position: absolute;
  width: 100%;
`;

interface IBox {
  bgPhoto: string;
  width: number;
}

const Box = styled(motion.div)<IBox>`
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  width: ${({ width }) => ((width / 100) * 92 - 20) / 5}px;
  height: ${({ width }) => (width - (width / 100) * 8 - 30) / 8}px;
  color: red;
  font-size: 50px;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 16px;
    color: white;
  }
`;

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.4,
    y: -50,
    transition: {
      delay: 0.4,
      duration: 0.3,
      type: "tween",
    },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.4,
      duration: 0.3,
      type: "tween",
    },
  },
};

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  opacity: 0;
`;

const BigTv = styled(motion.div)`
  z-index: 101;
  position: absolute;
  width: 45vw;
  height: 90vh;
  min-width: 450px;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.darker};
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 400px;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  position: relative;
  padding: 0 4%;
  top: -40px;
  font-size: 28px;
`;

const BigOverview = styled.p`
  color: ${(props) => props.theme.white.lighter};
  position: relative;
  padding: 0 4%;
  top: 0;
`;

const BigInfo = styled.div`
  color: ${(props) => props.theme.white.lighter};
  position: absolute;
  font-size: 20px;
  padding: 0 4%;
  bottom: 20px;
  right: 0;
`;

const offset = 5;

function Tv() {
  const history = useHistory();
  const bigTvMatch = useRouteMatch<{ tvId: string }>("/tv/:tvId");
  const { scrollY } = useViewportScroll();

  const { data: onAirData, isLoading: onAirLoading } = useQuery<IGetTvResult>(
    ["tv", "onAir"],
    onAir
  );
  const { data: airingTodayData, isLoading: airingTodayLoading } =
    useQuery<IGetTvResult>(["tv", "airingToday"], airingToday);
  const { data: popularTvData, isLoading: popularTvLoading } =
    useQuery<IGetTvResult>(["tv", "popularTv"], popularTv);
  const { data: topRatedTvData, isLoading: topRatedTvLoading } =
    useQuery<IGetTvResult>(["tv", "topRatedTv"], topRatedTv);

  const [windowSize, setWindowSize] = useState(window.innerWidth);
  const [back, setBack] = useState(false);

  const [witch, setWitch] = useState("");

  const rowVariants = {
    entry: (back: boolean) => ({
      x: back ? -windowSize : windowSize,
    }),
    center: {
      x: 0,
    },
    exit: (back: boolean) => ({
      x: back ? windowSize : -windowSize,
    }),
  };

  const [onAirIndex, setOnAirIndex] = useState(0);
  const [airingTodayIndex, setAiringTodayIndex] = useState(0);
  const [popularTvIndex, setPopularTvIndex] = useState(0);
  const [topRatedTvIndex, setTopRatedTvIndex] = useState(0);

  const [leaving, setLeaving] = useState(false);
  const handleResize = () => {
    setWindowSize(window.innerWidth);
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const changeOnAirIndex = (LR: number) => {
    if (onAirData) {
      if (leaving) return;
      const totalTv = onAirData?.results.length - 1;
      const maxIndex = Math.floor(totalTv / offset) - 1;
      const minIndex = 0;
      if (LR === 1) {
        setBack(false);
        setOnAirIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else {
        setBack(true);
        setOnAirIndex((prev) => (prev === minIndex ? maxIndex : prev - 1));
      }
      toggleLeaving();
    }
  };
  const changeAiringTodayIndex = (LR: number) => {
    if (airingTodayData) {
      if (leaving) return;
      const totalTv = airingTodayData?.results.length - 1;
      const maxIndex = Math.floor(totalTv / offset) - 1;
      const minIndex = 0;
      if (LR === 1) {
        setBack(false);
        setAiringTodayIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else {
        setBack(true);
        setAiringTodayIndex((prev) =>
          prev === minIndex ? maxIndex : prev - 1
        );
      }
      toggleLeaving();
    }
  };
  const changePopularTvIndex = (LR: number) => {
    if (popularTvData) {
      if (leaving) return;
      const totalTv = popularTvData?.results.length - 1;
      const maxIndex = Math.floor(totalTv / offset) - 1;
      const minIndex = 0;
      if (LR === 1) {
        setBack(false);
        setPopularTvIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else {
        setBack(true);
        setPopularTvIndex((prev) => (prev === minIndex ? maxIndex : prev - 1));
      }
      toggleLeaving();
    }
  };
  const changeTopRatedTvIndex = (LR: number) => {
    if (topRatedTvData) {
      if (leaving) return;
      const totalTv = topRatedTvData?.results.length - 1;
      const maxIndex = Math.floor(totalTv / offset) - 1;
      const minIndex = 0;
      if (LR === 1) {
        setBack(false);
        setTopRatedTvIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else {
        setBack(true);
        setTopRatedTvIndex((prev) => (prev === minIndex ? maxIndex : prev - 1));
      }
      toggleLeaving();
    }
  };
  const onBoxClicked = (tvId: number) => {
    history.push(`/tv/${tvId}`);
  };
  const onOverlayClick = () => history.goBack();
  const clickedTv = bigTvMatch?.params.tvId
    ? witch === "onAir"
      ? onAirData?.results.find(
          (tv) => String(tv.id) === bigTvMatch.params.tvId
        )
      : witch === "airing"
      ? airingTodayData?.results.find(
          (tv) => String(tv.id) === bigTvMatch.params.tvId
        )
      : witch === "popularTv"
      ? popularTvData?.results.find(
          (tv) => String(tv.id) === bigTvMatch.params.tvId
        )
      : witch === "topRatedTv"
      ? topRatedTvData?.results.find(
          (tv) => String(tv.id) === bigTvMatch.params.tvId
        )
      : null
    : null;
  return (
    <Wrapper>
      {onAirLoading ||
      airingTodayLoading ||
      popularTvLoading ||
      topRatedTvLoading ? (
        <Loader></Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(onAirData?.results[0].backdrop_path || "")}
          >
            <Title>{onAirData?.results[0].name}</Title>
            <Overview>{onAirData?.results[0].overview}</Overview>
          </Banner>
          <TvSlider>
            <OnAir width={windowSize}>
              <Kind>
                <LeftBtn
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  whileTap={{
                    scale: 1,
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  onClick={() => {
                    changeOnAirIndex(0);
                  }}
                  width={windowSize}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="chevron-left"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    className="svg-inline--fa fa-chevron-left fa-w-10 fa-5x"
                  >
                    <path
                      fill="currentColor"
                      d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
                    ></path>
                  </svg>
                </LeftBtn>
                <Type>OnAir TV Shows</Type>
                <RightBtn
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  whileTap={{
                    scale: 1,
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  onClick={() => {
                    changeOnAirIndex(1);
                  }}
                  width={windowSize}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="chevron-right"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    className="svg-inline--fa fa-chevron-right fa-w-10 fa-5x"
                  >
                    <path
                      fill="currentColor"
                      d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
                    ></path>
                  </svg>
                </RightBtn>
              </Kind>
              <AnimatePresence
                custom={back}
                initial={false}
                onExitComplete={toggleLeaving}
              >
                <Row
                  custom={back}
                  variants={rowVariants}
                  initial="entry"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.4 }}
                  key={onAirIndex}
                >
                  {onAirData?.results
                    .slice(1)
                    .slice(offset * onAirIndex, offset * onAirIndex + offset)
                    .map((tv) => (
                      <Box
                        onClick={() => {
                          setWitch("onAir");
                          onBoxClicked(tv.id);
                        }}
                        layoutId={"onAir" + tv.id}
                        width={windowSize}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: "tween" }}
                        variants={boxVariants}
                        bgPhoto={
                          tv.backdrop_path
                            ? makeImagePath(tv.backdrop_path, "w500")
                            : require("../assets/noImage.PNG")
                        }
                        key={tv.id}
                      >
                        <Info variants={infoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </OnAir>

            <AiringToday width={windowSize}>
              <Kind>
                <LeftBtn
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  whileTap={{
                    scale: 1,
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  onClick={() => {
                    changeAiringTodayIndex(0);
                  }}
                  width={windowSize}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="chevron-left"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    className="svg-inline--fa fa-chevron-left fa-w-10 fa-5x"
                  >
                    <path
                      fill="currentColor"
                      d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
                    ></path>
                  </svg>
                </LeftBtn>
                <Type>AiringToday TV Shows</Type>
                <RightBtn
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  whileTap={{
                    scale: 1,
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  onClick={() => {
                    changeAiringTodayIndex(1);
                  }}
                  width={windowSize}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="chevron-right"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    className="svg-inline--fa fa-chevron-right fa-w-10 fa-5x"
                  >
                    <path
                      fill="currentColor"
                      d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
                    ></path>
                  </svg>
                </RightBtn>
              </Kind>
              <AnimatePresence
                custom={back}
                initial={false}
                onExitComplete={toggleLeaving}
              >
                <Row
                  custom={back}
                  variants={rowVariants}
                  initial="entry"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.4 }}
                  key={airingTodayIndex}
                >
                  {airingTodayData?.results
                    .slice(
                      offset * airingTodayIndex,
                      offset * airingTodayIndex + offset
                    )
                    .map((tv) => (
                      <Box
                        onClick={() => {
                          setWitch("airing");
                          onBoxClicked(tv.id);
                        }}
                        layoutId={"airing" + tv.id}
                        width={windowSize}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: "tween" }}
                        variants={boxVariants}
                        bgPhoto={
                          tv.backdrop_path
                            ? makeImagePath(tv.backdrop_path, "w500")
                            : require("../assets/noImage.PNG")
                        }
                        key={tv.id}
                      >
                        <Info variants={infoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </AiringToday>

            <PoPularTv width={windowSize}>
              <Kind>
                <LeftBtn
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  whileTap={{
                    scale: 1,
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  onClick={() => {
                    changePopularTvIndex(0);
                  }}
                  width={windowSize}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="chevron-left"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    className="svg-inline--fa fa-chevron-left fa-w-10 fa-5x"
                  >
                    <path
                      fill="currentColor"
                      d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
                    ></path>
                  </svg>
                </LeftBtn>
                <Type>Popular TV Shows</Type>
                <RightBtn
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  whileTap={{
                    scale: 1,
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  onClick={() => {
                    changePopularTvIndex(1);
                  }}
                  width={windowSize}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="chevron-right"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    className="svg-inline--fa fa-chevron-right fa-w-10 fa-5x"
                  >
                    <path
                      fill="currentColor"
                      d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
                    ></path>
                  </svg>
                </RightBtn>
              </Kind>
              <AnimatePresence
                custom={back}
                initial={false}
                onExitComplete={toggleLeaving}
              >
                <Row
                  custom={back}
                  variants={rowVariants}
                  initial="entry"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.4 }}
                  key={popularTvIndex}
                >
                  {popularTvData?.results
                    .slice(
                      offset * popularTvIndex,
                      offset * popularTvIndex + offset
                    )
                    .map((tv) => (
                      <Box
                        onClick={() => {
                          setWitch("popularTv");
                          onBoxClicked(tv.id);
                        }}
                        layoutId={"popularTv" + tv.id}
                        width={windowSize}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: "tween" }}
                        variants={boxVariants}
                        bgPhoto={
                          tv.backdrop_path
                            ? makeImagePath(tv.backdrop_path, "w500")
                            : require("../assets/noImage.PNG")
                        }
                        key={tv.id}
                      >
                        <Info variants={infoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </PoPularTv>

            <TopRatedTv width={windowSize}>
              <Kind>
                <LeftBtn
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  whileTap={{
                    scale: 1,
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  onClick={() => {
                    changeTopRatedTvIndex(0);
                  }}
                  width={windowSize}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="chevron-left"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    className="svg-inline--fa fa-chevron-left fa-w-10 fa-5x"
                  >
                    <path
                      fill="currentColor"
                      d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
                    ></path>
                  </svg>
                </LeftBtn>
                <Type>Top Rated TV Shows</Type>
                <RightBtn
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  whileTap={{
                    scale: 1,
                    transition: { type: "tween", duration: 0.2 },
                  }}
                  onClick={() => {
                    changeTopRatedTvIndex(1);
                  }}
                  width={windowSize}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="chevron-right"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    className="svg-inline--fa fa-chevron-right fa-w-10 fa-5x"
                  >
                    <path
                      fill="currentColor"
                      d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
                    ></path>
                  </svg>
                </RightBtn>
              </Kind>
              <AnimatePresence
                custom={back}
                initial={false}
                onExitComplete={toggleLeaving}
              >
                <Row
                  custom={back}
                  variants={rowVariants}
                  initial="entry"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.4 }}
                  key={topRatedTvIndex}
                >
                  {topRatedTvData?.results
                    .slice(
                      offset * topRatedTvIndex,
                      offset * topRatedTvIndex + offset
                    )
                    .map((tv) => (
                      <Box
                        onClick={() => {
                          setWitch("topRatedTv");
                          onBoxClicked(tv.id);
                        }}
                        layoutId={"topRatedTv" + tv.id}
                        width={windowSize}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: "tween" }}
                        variants={boxVariants}
                        bgPhoto={
                          tv.backdrop_path
                            ? makeImagePath(tv.backdrop_path, "w500")
                            : require("../assets/noImage.PNG")
                        }
                        key={tv.id}
                      >
                        <Info variants={infoVariants}>
                          <h4>{tv.name}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </TopRatedTv>
          </TvSlider>
          <AnimatePresence>
            {bigTvMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigTv
                  style={{ top: scrollY.get() + 35 }}
                  layoutId={witch + bigTvMatch.params.tvId}
                >
                  {clickedTv && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, #181818, transparent), url(${makeImagePath(
                            clickedTv.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedTv.name}</BigTitle>
                      <BigOverview>{clickedTv.overview}</BigOverview>
                      <BigInfo>First Air : {clickedTv.first_air_date}</BigInfo>
                    </>
                  )}
                </BigTv>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Tv;
