import React from "react";
import RotateGamingNews from "../Rotate/RotateGamingNews.jsx";
import { API_BASE, useApi } from "../Components/apiCache.js";
import { SectionLoader } from "../Components/SectionHeader.jsx";

function toArticles(data) {
    if (!Array.isArray(data?.articles)) return [];
    return data.articles.map((article) => ({
        url: article.url,
        title: article.title,
        description: article.description,
        urlToImage: article.urlToImage,
        author: article.author,
        publishedAt: article.publishedAt,
    }));
}

export default function GamingNews() {
    const { data: articles, loading } = useApi(`${API_BASE}/getgamingnews`, toArticles);

    return (
        <section className="!mb-12">
            {!loading && articles ? (
                <RotateGamingNews articles={articles} name={"Latest Gaming News"} />
            ) : (
                <SectionLoader title="Latest gaming news" height="h-[300px]" />
            )}
        </section>
    );
}
