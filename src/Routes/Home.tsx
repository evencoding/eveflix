import { useQuery } from "react-query";
import styled from "styled-components";
import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import {
  nowPlayingMovie,
  IGetMoviesResult,
  upcomingMovie,
  topRatedMovie,
  popularMovies,
} from "./api";
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

const HomeSlider = styled.div`
  position: relative;
`;

const NowPlaying = styled.div<{ width: number }>`
  position: relative;
`;

const Upcoming = styled.div<{ width: number }>`
  position: relative;
  top: ${({ width }) => width / 8 + 80}px;
`;

const Popular = styled.div<{ width: number }>`
  position: relative;
  top: ${({ width }) => width / 4 + 160}px;
`;

const TopRated = styled.div<{ width: number }>`
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

export interface IBox {
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

export const boxVariants = {
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

export const infoVariants = {
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

const BigMovie = styled(motion.div)`
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
  width: 60%;
  font-size: 18px;
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

function Home() {
  const history = useHistory();
  const bigMovieMatch = useRouteMatch<{ movieId: string }>("/movies/:movieId");
  const { scrollY } = useViewportScroll();

  const { data, isLoading } = useQuery<IGetMoviesResult>(
    ["movies", "nowPlaying"],
    nowPlayingMovie
  );
  const { data: upcomingData, isLoading: upcomingLoading } =
    useQuery<IGetMoviesResult>(["movies", "upcoming"], upcomingMovie);
  const { data: popularData, isLoading: popularLoading } =
    useQuery<IGetMoviesResult>(["movies", "popular"], popularMovies);
  const { data: topData, isLoading: topLoading } = useQuery<IGetMoviesResult>(
    ["movies", "top"],
    topRatedMovie
  );

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

  const [nowIndex, setNowIndex] = useState(0);
  const [upIndex, setUpIndex] = useState(0);
  const [popularIndex, setPopularIndex] = useState(0);
  const [topRatedIndex, settopRatedIndex] = useState(0);

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
  const changeNowIndex = (LR: number) => {
    if (data) {
      if (leaving) return;
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      const minIndex = 0;
      if (LR === 1) {
        setBack(false);
        setNowIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else {
        setBack(true);
        setNowIndex((prev) => (prev === minIndex ? maxIndex : prev - 1));
      }
      toggleLeaving();
    }
  };
  const changeUpIndex = (LR: number) => {
    if (upcomingData) {
      if (leaving) return;
      const totalMovies = upcomingData?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      const minIndex = 0;
      if (LR === 1) {
        setBack(false);
        setUpIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else {
        setBack(true);
        setUpIndex((prev) => (prev === minIndex ? maxIndex : prev - 1));
      }
      toggleLeaving();
    }
  };
  const changePopularIndex = (LR: number) => {
    if (popularData) {
      if (leaving) return;
      const totalMovies = popularData?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      const minIndex = 0;
      if (LR === 1) {
        setBack(false);
        setPopularIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else {
        setBack(true);
        setPopularIndex((prev) => (prev === minIndex ? maxIndex : prev - 1));
      }
      toggleLeaving();
    }
  };
  const changeTopRatedIndex = (LR: number) => {
    if (topData) {
      if (leaving) return;
      const totalMovies = topData?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      const minIndex = 0;
      if (LR === 1) {
        setBack(false);
        settopRatedIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else {
        setBack(true);
        settopRatedIndex((prev) => (prev === minIndex ? maxIndex : prev - 1));
      }
      toggleLeaving();
    }
  };
  const onBoxClicked = (movieId: number) => {
    history.push(`/movies/${movieId}`);
  };
  const onOverlayClick = () => history.goBack();
  const clickedMovie = bigMovieMatch?.params.movieId
    ? witch === "now"
      ? data?.results.find(
          (movie) => String(movie.id) === bigMovieMatch.params.movieId
        )
      : witch === "up"
      ? upcomingData?.results.find(
          (movie) => String(movie.id) === bigMovieMatch.params.movieId
        )
      : witch === "popular"
      ? popularData?.results.find(
          (movie) => String(movie.id) === bigMovieMatch.params.movieId
        )
      : witch === "top"
      ? topData?.results.find(
          (movie) => String(movie.id) === bigMovieMatch.params.movieId
        )
      : null
    : null;
  console.log(data);
  return (
    <Wrapper>
      {isLoading || upcomingLoading || topLoading || popularLoading ? (
        <Loader></Loader>
      ) : (
        <>
          <Banner bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}>
            <Title>{data?.results[0].title}</Title>
            <Overview>{data?.results[0].overview}</Overview>
          </Banner>
          <HomeSlider>
            <NowPlaying width={windowSize}>
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
                    changeNowIndex(0);
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
                <Type>Now Playing</Type>
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
                    changeNowIndex(1);
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
                  key={nowIndex}
                >
                  {data?.results
                    .slice(1)
                    .slice(offset * nowIndex, offset * nowIndex + offset)
                    .map((movie) => (
                      <Box
                        onClick={() => {
                          setWitch("now");
                          onBoxClicked(movie.id);
                        }}
                        layoutId={"now" + movie.id}
                        width={windowSize}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: "tween" }}
                        variants={boxVariants}
                        bgPhoto={makeImagePath(
                          movie.backdrop_path || "",
                          "w500"
                        )}
                        key={movie.id}
                      >
                        <Info variants={infoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </NowPlaying>
            <Upcoming width={windowSize}>
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
                    changeUpIndex(0);
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
                <Type>Upcoming Movies</Type>
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
                    changeUpIndex(1);
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
                  key={upIndex}
                >
                  {upcomingData?.results
                    .slice(offset * upIndex, offset * upIndex + offset)
                    .map((movie) => (
                      <Box
                        onClick={() => {
                          setWitch("up");
                          onBoxClicked(movie.id);
                        }}
                        layoutId={"up" + movie.id}
                        width={windowSize}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: "tween" }}
                        variants={boxVariants}
                        bgPhoto={makeImagePath(
                          movie.backdrop_path || "",
                          "w500"
                        )}
                        key={movie.id}
                      >
                        <Info variants={infoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </Upcoming>

            <Popular width={windowSize}>
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
                    changePopularIndex(0);
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
                <Type>Popular Movies</Type>
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
                    changePopularIndex(1);
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
                  key={popularIndex}
                >
                  {popularData?.results
                    .slice(
                      offset * popularIndex,
                      offset * popularIndex + offset
                    )
                    .map((movie) => (
                      <Box
                        onClick={() => {
                          setWitch("popular");
                          onBoxClicked(movie.id);
                        }}
                        layoutId={"popular" + movie.id}
                        width={windowSize}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: "tween" }}
                        variants={boxVariants}
                        bgPhoto={makeImagePath(
                          movie.backdrop_path || "",
                          "w500"
                        )}
                        key={movie.id}
                      >
                        <Info variants={infoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </Popular>

            <TopRated width={windowSize}>
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
                    changeTopRatedIndex(0);
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
                <Type>Top Rated Movies</Type>
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
                    changeTopRatedIndex(1);
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
                  key={topRatedIndex}
                >
                  {topData?.results
                    .slice(
                      offset * topRatedIndex,
                      offset * topRatedIndex + offset
                    )
                    .map((movie) => (
                      <Box
                        onClick={() => {
                          setWitch("top");
                          onBoxClicked(movie.id);
                        }}
                        layoutId={"top" + movie.id}
                        width={windowSize}
                        whileHover="hover"
                        initial="normal"
                        transition={{ type: "tween" }}
                        variants={boxVariants}
                        bgPhoto={makeImagePath(
                          movie.backdrop_path || "",
                          "w500"
                        )}
                        key={movie.id}
                      >
                        <Info variants={infoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
            </TopRated>
          </HomeSlider>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
                  style={{ top: scrollY.get() + 35 }}
                  layoutId={witch + bigMovieMatch.params.movieId}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, #181818, transparent), url(${makeImagePath(
                            clickedMovie.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                      <BigInfo>release : {clickedMovie.release_date}</BigInfo>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
