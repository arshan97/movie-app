const Genres = ({ genres, selectedGenres, handleGenreChange }) => {
  return (
    <div className="genre-filters">
      {genres.map((genre) => (
        <div
          key={genre.id}
          className={`genre-chip ${
            selectedGenres.includes(genre.id) ? "selected" : ""
          }`}
          onClick={() => handleGenreChange(genre.id)}
        >
          {genre.name}
        </div>
      ))}
    </div>
  );
};

export default Genres;
