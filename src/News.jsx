import { useState, useEffect } from "react";
import axios from "axios";

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
    }, 10000);

    return () => clearInterval(interval);
  }, [newsItems]);

  return (
    <section id="news" className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Latest Steam News</h2>
      <div className="carousel-container overflow-hidden">
        <div className="carousel flex" style={{ transform: `translateX(-${currentIndex * 100}%)`, transition: "transform 1s ease-in-out", }} >
          {newsItems.map((news, index) => (
            <div key={news._id} className="game-card carousel-item flex-none w-full">
              <div className=" p-4 rounded-md shadow-md min-h-[20%] max-h-[80%]">
                  <div className="relative mb-4">
                  {news._images_?.[0] && <img src={news._images_[0]} alt={news._title} className="w-full h-48 object-cover rounded-md"/>}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{news._title}</h3>
                  <p className="text-sm text-gray-400">{news.short}</p> 
                  <div className="flex-grow mt-10"></div>
                  <div className="float-start">
                    <p className="text-xs text-gray-500 mt-2">
                      {news.author && `By: ${news.author}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-3">
                    { `Date: ${news.lastModified.split("T")[0]}`}
                    </p>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
