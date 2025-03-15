import React, { useEffect, useState } from "react";
import RotateGamingNews from "../Rotate/RotateGamingNews.jsx";  

export default function GamingNews() {
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        fetchArticles();
    }, []);

    async function fetchArticles() {
        try {
            const response = await fetch("https://gamehub-backend-zekj.onrender.com/getgamingnews");  
            const data = await response.json();

            const articlesData = data.articles.map((article) => ({
                url: article.url,
                title: article.title,
                description: article.description,
                urlToImage: article.urlToImage,
                author: article.author,
                publishedAt: article.publishedAt,
            }));

            setArticles(articlesData);
        } catch (error) {
            console.error("Error fetching gaming news:", error);
        }
    }

    return (
        <section className="mb-8">
            <RotateGamingNews articles={articles} name={"Latest Gaming News"} />
        </section>
    );
}
