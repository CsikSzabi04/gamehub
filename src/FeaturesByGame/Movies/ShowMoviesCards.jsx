import React, { useContext, useState, useEffect } from 'react';
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import { FaPlay, FaTimes } from "react-icons/fa";
import { FaCheck } from 'react-icons/fa6';
import { UserContext } from '../../Features/UserContext';

export default function ShowMoviesCards({ selectedMovie, closeModal, modalVisible }) {
    const { user } = useContext(UserContext);
    const [error, setError] = useState('');
    const [fav, setFav] = useState(false);
    const [favok, setFavok] = useState([]);
    const [trailerUrl, setTrailerUrl] = useState(null);
    const [loadingTrailer, setLoadingTrailer] = useState(false);

    useEffect(() => {
        if (modalVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [modalVisible]);

    if (!selectedMovie) return null;
    const truncatedOverview = selectedMovie.overview.length > 150 ? `${selectedMovie.overview.substring(0, 150)}...` : selectedMovie.overview;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-900 rounded-xl overflow-hidden w-full max-w-2xl relative  max-h-[80%]  overflow-y-auto">
                <div className="absolute -bottom-2 -right-2 p-2 bg-yellow-500 text-gray-900 font-bold rounded-full w-12 h-12 flex items-center justify-center z-10 border-2 border-white shadow-lg">
                    {selectedMovie.vote_average?.toFixed(1)}
                </div>
                <button onClick={closeModal} className="absolute top-4 mb-5 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2 transition-all duration-200 hover:bg-opacity-75"><FaTimes className="text-xl" /> </button>
                <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-1/3">
                        <img src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}alt={selectedMovie.title}  className="w-full h-full object-cover" loading="lazy"/>
                    </div>
                    <div className="w-full md:w-2/3 p-6">
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedMovie.title}</h2>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                                {selectedMovie.release_date}
                            </span>
                            <span className="bg-blue-900 text-white px-3 py-1 rounded-full text-sm">
                                {selectedMovie.media_type == 'movie' ? 'Movie' : 'TV Show'}
                            </span>
                        </div>

                        <p className="text-gray-300 mb-6">{truncatedOverview}</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <span className="text-gray-400 text-sm">Popularity: </span>
                                <span className="text-gray-300 ml-2  font-medium">{selectedMovie.popularity.toFixed(2)}</span>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg">
                                <span className="text-gray-400 text-sm">Vote Count: </span>
                                <span className="text-gray-300 ml-2 font-medium">{selectedMovie.vote_count}</span>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            {selectedMovie.adult ? (<div className="bg-red-600 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center z-10 border-2 border-white shadow-lg"> 18+ </div>) : (<div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center z-10 border-2 border-white shadow-lg"><FaCheck className="text-xl" /></div>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}