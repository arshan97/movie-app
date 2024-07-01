import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "../App.css";
import Genres from "./Genres";
import MovieCard from "./MovieCard";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [year, setYear] = useState(2012);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const API_KEY = "2dca580c2a14b55200e784d157207b4d";

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/genre/movie/list`,
          {
            params: {
              api_key: API_KEY,
              language: "en",
            },
          }
        );
        setGenres((prev) => [...prev, ...response.data.genres]);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

  // Helper function to load movies based on year and genre change
  const loadMovies = async (newYear, genreIds = []) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie`,
        {
          params: {
            api_key: API_KEY,
            sort_by: "popularity.desc",
            primary_release_year: newYear,
            vote_count_gte: 100,
            page: 1,
            with_genres: genreIds.join(","),
          },
        }
      );

      const movieData = await Promise.all(
        response.data.results.map(async (movie) => {
          const movieDetails = await axios.get(
            `https://api.themoviedb.org/3/movie/${movie.id}`,
            {
              params: {
                api_key: API_KEY,
                append_to_response: "credits",
              },
            }
          );
          return { ...movie, details: movieDetails.data };
        })
      );

      if (direction === "down") {
        setMovies((prevMovies) => [...prevMovies, ...movieData]);
      } else {
        setMovies((prevMovies) => [...movieData, ...prevMovies]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMovies(year, selectedGenres);
  }, [year, selectedGenres]);

  const observer = useRef();

  // Infinite Scrolling with Intersection Observer to detect ref when scrolled down
  const lastMovieElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setDirection("down");
          setYear((prevYear) => prevYear - 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading]
  );

  // Infinite Scrolling with Intersection Observer to detect ref when scrolled up
  const firstMovieElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setDirection("up");
          setYear((prevYear) => prevYear + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading]
  );

  // Helper function to chunk movies into groups of 20
  const chunkMovies = (movies) => {
    const chunks = [];
    for (let i = 0; i < movies.length; i += 20) {
      chunks.push(movies.slice(i, i + 20));
    }
    return chunks;
  };

  // Helper function to handle genre change
  const handleGenreChange = (genreId) => {
    setMovies([]);
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter((id) => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const movieChunks = chunkMovies(movies);

  return (
    <div>
      <h2 className="title">MOVIEFIX</h2>
      <Genres
        genres={genres}
        selectedGenres={selectedGenres}
        handleGenreChange={handleGenreChange}
      />
      {movieChunks.map((chunk, chunkIndex) => (
        <div key={chunkIndex} className="movie-list">
          <h2 className="year">{2012 - chunkIndex}</h2>
          <div className="movie-cards">
            {chunk.map((movie, movieIndex) => (
              <MovieCard
                movie={movie}
                chunk={chunk}
                chunkIndex={chunkIndex}
                firstMovieElementRef={firstMovieElementRef}
                lastMovieElementRef={lastMovieElementRef}
                movieChunks={movieChunks}
                movieIndex={movieIndex}
                key={movie.id}
              />
            ))}
          </div>
        </div>
      ))}
      {isLoading && <p>Loading...</p>}
    </div>
  );
};

export default MovieList;
