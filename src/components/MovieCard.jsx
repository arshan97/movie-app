const MovieCard = ({
  movie,
  movieIndex,
  chunk,
  chunkIndex,
  movieChunks,
  lastMovieElementRef,
  firstMovieElementRef,
}) => {
  return (
    <div
      key={movie.id}
      className="movie-card"
      ref={
        movieIndex === chunk.length - 1 && chunkIndex === movieChunks.length - 1
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
            {movie.details.genres.map((genre) => genre.name).join(", ")}
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
  );
};

export default MovieCard;
