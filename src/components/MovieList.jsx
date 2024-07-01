import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "../App.css";
import Genres from "./Genres";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [year, setYear] = useState(2012);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const API_KEY = "2dca580c2a14b55200e784d157207b4d";

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
        console.log(response);
        setGenres((prev) => [...prev, ...response.data.genres]);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

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
              <div
                key={movie.id}
                className="movie-card"
                ref={
                  movieIndex === chunk.length - 1 &&
                  chunkIndex === movieChunks.length - 1
                    ? lastMovieElementRef
                    : movieIndex === 0 && chunkIndex === 0
                    ? firstMovieElementRef
                    : null
                }
              >
                <div className="movie-card-image-wrapper">
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    alt={`${movie.title} Poster`}
                    className="movie-card-image"
                  />
                  <div className="movie-card-overlay">
                    <h3>{movie.title}</h3>
                    <p>
                      <strong>Genres:</strong>{" "}
                      {movie.details.genres
                        .map((genre) => genre.name)
                        .join(", ")}
                    </p>
                    <p>
                      <strong>Cast:</strong>{" "}
                      {movie.details.credits.cast
                        .slice(0, 3)
                        .map((actor) => actor.name)
                        .join(", ")}
                    </p>
                    <p>
                      <strong>Director:</strong>{" "}
                      {
                        movie.details.credits.crew.find(
                          (person) => person.job === "Director"
                        )?.name
                      }
                    </p>
                    <p>{movie.overview.slice(0, 100)}...</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {isLoading && <p>Loading...</p>}
    </div>
  );
};

export default MovieList;
