import { useState, useEffect } from "react";
import axios from "axios";
import { FaAngleLeft,  FaChevronRight } from "react-icons/fa6";


export default function News() {
  const [newsItems, setNewsItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await axios.get("https://gamehub-backend-zekj.onrender.com/news");
        setNewsItems(response.data);
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    }
    fetchNews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
    }, 20000);

    return () => clearInterval(interval);
  }, [newsItems]);

  const nextItem = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % newsItems.length);
  };

  const prevItem = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + newsItems.length) % newsItems.length);
  };

  return (
    <section id="news" className="mb-8 px-4 relative">
      <h2 className="text-2xl font-semibold mb-4">Latest Steam News</h2>
      <div className="relative group">
        <button onClick={prevItem} className="absolute -left-5 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" aria-label="Previous news">
          <FaAngleLeft size={20} />
        </button>
        <div className="relative overflow-hidden">
          <div className="carousel flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {newsItems.map((news) => (
              <div key={news.id} className="game-card carousel-item flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2">
                <div className="bg-gray-800 p-4 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <div className="relative mb-4 overflow-hidden rounded-md">
                    {news.thumbnail && (
                      <img src={news.thumbnail} alt={news.title} className="h-48 w-full object-cover hover:scale-105 transition-transform duration-500" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{news.title}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3">{news.short_description}</p>
                  <div className="mt-auto">
                    <p className="text-xs text-gray-500 mt-2">{`Publisher: ${news.publisher}`}</p>
                    <p className="text-xs text-gray-500 mt-1">{`Release Date: ${news.release_date}`}</p>
                    <a href={news.game_url} target="_blank" rel="noopener noreferrer" className="inline-block text-blue-500 hover:text-blue-400 text-sm mt-3 transition-colors duration-200"> Read More</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={nextItem} className="absolute -right-5 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" aria-label="Next news">
          <FaChevronRight size={20} />
        </button>
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        {newsItems.map((_, index) => (
          <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-gray-600'}`} aria-label={`Go to news ${index + 1}`} />
        ))}
      </div>
    </section>
  );
}