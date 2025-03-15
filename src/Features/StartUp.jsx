import { useState, useEffect } from "react";

export default function StartUp({ onLoaded }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            onLoaded();
        }, 2000); 

        return () => clearTimeout(timer);
    }, [onLoaded]);

    return (
        loading && (
            <div className="fixed inset-0 flex flex-col justify-center items-center bg-black text-white text-3xl font-bold">
                <img src="./main.png" alt="Main" className="mb-10 rounded-3xl " /> 
                <h1>Loading...</h1>
            </div>
        )
    );
}
