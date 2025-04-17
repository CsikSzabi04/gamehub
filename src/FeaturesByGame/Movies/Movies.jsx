import React, { useEffect, useState } from "react";
import RotateMovies from "./RotateMovies";
import ShowMoviesCards from "./ShowMoviesCards";

export default function Movies() {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchMovies();
    }, []);

    async function fetchMovies() {
        try {
            const response = await fetch("https://gamehub-backend-zekj.onrender.com/movies");
            const data = await response.json();
            
            const formattedMovies = data.results.map(movie => ({
                id: movie.id,
                title: movie.title || movie.name,
                backdrop_path: movie.backdrop_path,
                poster_path: movie.poster_path,
                overview: movie.overview,
                release_date: movie.release_date || movie.first_air_date,
                vote_average: movie.vote_average,
                media_type: movie.media_type,
                adult:movie.adult,
                popularity:movie.popularity,
                vote_count:movie.vote_count
            }));

            setMovies(formattedMovies);
        } catch (error) {
            console.error("Error fetching movies:", error);
        }
    }

    function showMovieDetails(movie) {
        setSelectedMovie(movie);
        setModalVisible(true);
    }

    function closeModal() {
        setModalVisible(false);
        setSelectedMovie(null);
    }

    return (
        <section id="movies" className="mb-8">
            <RotateMovies movies={movies} showMovieDetails={showMovieDetails} name="Popular Movies" />
            {modalVisible && selectedMovie && (<ShowMoviesCards selectedMovie={selectedMovie} closeModal={closeModal} modalVisible={modalVisible} />)}
        </section>
    );
}