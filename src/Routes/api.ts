const API_KEY = "c2f4c6739f939415d302ea7425537908";
const BASE_PATH = "https://api.themoviedb.org/3";

interface IMovie {
  id: number;
  backdrop_path: string;
  poster_path: string;
  title: string;
  overview: string;
  genre_ids: number[];
  release_date: string;
  vote_average: number;
  vote_count: number;
}

interface ITv {
  backdrop_path: string;
  first_air_data: string;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  first_air_date: string;
}

export interface IGetTvResult {
  page: number;
  results: ITv[];
}

export interface IGetMoviesResult {
  dates: {
    maximum: string;
    minimum: string;
  };
  page: number;
  results: IMovie[];
}

export function nowPlayingMovie() {
  return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function upcomingMovie() {
  return fetch(`${BASE_PATH}/movie/upcoming?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function popularMovies() {
  return fetch(`${BASE_PATH}/movie/popular?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function topRatedMovie() {
  return fetch(`${BASE_PATH}/movie/top_rated?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function onAir() {
  return fetch(`${BASE_PATH}/tv/on_the_air?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function airingToday() {
  return fetch(`${BASE_PATH}/tv/airing_today?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function popularTv() {
  return fetch(`${BASE_PATH}/tv/popular?api_key=${API_KEY}`).then((response) =>
    response.json()
  );
}

export function topRatedTv() {
  return fetch(`${BASE_PATH}/tv/top_rated?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function searchMovie(term: string) {
  return fetch(
    `${BASE_PATH}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
      term
    )}`
  ).then((response) => response.json());
}

export function searchTv(term: string) {
  return fetch(
    `${BASE_PATH}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
      term
    )}`
  ).then((response) => response.json());
}
