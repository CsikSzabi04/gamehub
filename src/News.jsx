import { useState, useEffect } from "react";
import axios from "axios";
import "tailwindcss";

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

  return (
    <section id="news" className="mb-8 px-4">
      <h2 className="text-2xl font-semibold mb-4">Latest Steam News</h2>
      <div className="relative overflow-hidden">
        <div className="carousel flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }} >
          {newsItems.map((news) => (
            <div key={news.id}  className="game-card carousel-item flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4" >
              <div className="p-4 rounded-md shadow-md min-h-[20%] max-h-[80%] flex flex-col justify-between h-full">
                <div className="relative mb-4">
                  {news.thumbnail && (
                    <img src={news.thumbnail}  alt={news.title} className="h-48 w-full object-cover rounded-md" />)}
                </div>
                <h3 className="text-lg font-bold mb-2">{news.title}</h3>
                <p className="text-sm text-gray-400">{news.short_description}</p>
                <div className="flex-grow mt-10"></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mt-2">{`Publisher: ${news.publisher}`}</p>
                <p className="text-xs text-gray-500 mt-3">{`Release Date: ${news.release_date}`}</p>
                <a href={news.game_url} target="_blank"  rel="noopener noreferrer" className="text-blue-500 text-sm mt-3 block">Read More </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
