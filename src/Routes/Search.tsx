/* eslint-disable react-hooks/rules-of-hooks */
import { AnimatePresence, motion, useViewportScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { searchMovie, searchTv } from "./api";
import { IBox, boxVariants, infoVariants } from "./Home";
import { makeImagePath } from "./utils";

interface ISearchTV {
  backdrop_path: string;
  first_air_date: string;
  release_date?: string;
  name?: string;
  title?: string;
  id: number;
  media_type: string;
  overview: string;
}

interface ISearchTVResult {
  page: number;
  results: ISearchTV[];
}

interface ISearchMovie {
  backdrop_path: string;
  id: number;
  release_date: string;
  first_air_date?: string;
  title?: string;
  name?: string;
  overview: string;
}

interface ISearchMovieResult {
  page: number;
  results: ISearchMovie[];
}

const Wrapper = styled.div``;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Results = styled.div`
  margin-top: 15vh;
  padding: 0 4vw;
`;

const Witch = styled.div`
  margin-bottom: 15px;
  font-size: 28px;
  font-weight: 600;
`;

const MovieResult = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 10vh;
`;

const TVResult = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 10vh;
`;

const Box = styled(motion.div)<IBox>`
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  background-color: none;
  width: ${({ width }) => ((width / 100) * 92 - 20) / 4.3}px;
  height: ${({ width }) => (width - (width / 100) * 8 - 30) / 7}px;
  color: red;
  font-size: 50px;
  cursor: pointer;
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

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  opacity: 0;
`;

const BigContent = styled(motion.div)`
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

function Search() {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).toString().split("=")[1];
  const history = useHistory();
  const bigSearchMatch =
    useRouteMatch<{ contentId: string }>("/search/:contentId");
  const [windowSize, setWindowSize] = useState(window.innerWidth);
  const [witch, setWitch] = useState("");
  const { scrollY } = useViewportScroll();
  const handleResize = () => {
    setWindowSize(window.innerWidth);
  };
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
  const { data: searchMovieData, isLoading: movieLoading } =
    useQuery<ISearchMovieResult>(["movies", "search"], () =>
      searchMovie(keyword)
    );
  const { data: searchTvData, isLoading: tvLoading } =
    useQuery<ISearchTVResult>(["tv", "search"], () => searchTv(keyword));

  const onBoxClicked = (contentId: number) => {
    history.push(`/search/${contentId}`);
  };
  const onOverlayClick = () => history.goBack();
  const clickedContent = bigSearchMatch?.params.contentId
    ? witch === "movie"
      ? searchMovieData?.results.find(
          (movie) => String(movie.id) === bigSearchMatch.params.contentId
        )
      : witch === "tv"
      ? searchTvData?.results.find(
          (tv) => String(tv.id) === bigSearchMatch.params.contentId
        )
      : null
    : null;
  return (
    <Wrapper>
      {movieLoading || tvLoading ? (
        <Loader></Loader>
      ) : (
        <>
          <Results>
            <Witch>Movie Results</Witch>
            <MovieResult>
              {searchMovieData?.results?.map((d) => (
                <Box
                  onClick={() => {
                    setWitch("movie");
                    onBoxClicked(d.id);
                  }}
                  layoutId={"" + d.id}
                  width={windowSize}
                  whileHover="hover"
                  initial="normal"
                  transition={{ type: "tween" }}
                  variants={boxVariants}
                  bgPhoto={
                    d.backdrop_path
                      ? makeImagePath(d.backdrop_path, "w500")
                      : require("../assets/noImage.PNG")
                  }
                  key={d.id}
                >
                  <Info variants={infoVariants}>
                    <h4>{d.title}</h4>
                  </Info>
                </Box>
              ))}
            </MovieResult>
            <Witch>TV Results</Witch>
            <TVResult>
              {searchTvData?.results?.map((d) => (
                <Box
                  onClick={() => {
                    setWitch("tv");
                    onBoxClicked(d.id);
                  }}
                  layoutId={"" + d.id}
                  width={windowSize}
                  whileHover="hover"
                  initial="normal"
                  transition={{ type: "tween" }}
                  variants={boxVariants}
                  bgPhoto={
                    d.backdrop_path
                      ? makeImagePath(d.backdrop_path, "w500")
                      : require("../assets/noImage.PNG")
                  }
                  key={d.id}
                >
                  <Info variants={infoVariants}>
                    <h4>{d.name}</h4>
                  </Info>
                </Box>
              ))}
            </TVResult>
          </Results>
          <AnimatePresence>
            {bigSearchMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigContent
                  style={{ top: scrollY.get() + 35 }}
                  layoutId={bigSearchMatch.params.contentId}
                >
                  {clickedContent && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, #181818, transparent), url(${makeImagePath(
                            clickedContent.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>
                        {clickedContent?.title
                          ? clickedContent.title
                          : clickedContent.name}
                      </BigTitle>
                      <BigOverview>{clickedContent.overview}</BigOverview>
                      <BigInfo>
                        release :{" "}
                        {clickedContent.release_date
                          ? clickedContent.release_date
                          : clickedContent.first_air_date}
                      </BigInfo>
                    </>
                  )}
                </BigContent>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Search;
