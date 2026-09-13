import { useEffect, useState } from "react";
import { cachedFetch } from "../Components/apiCache.js";

// Currently not used by any page. Store list modal controlled by the parent.
export default function Stores({ modalStoreVisible, closeStore }) {
    const [store, setStore] = useState([])

    useEffect(() => {
        async function getStores() {
            try {
                const stores = await cachedFetch('https://gamehub-backend-zekj.onrender.com/stores');
                setStore(Array.isArray(stores) ? stores : []);
            } catch (error) { console.log({ "Fetch error: ": error }) }
        }
        getStores()
    }, [])

    if (!modalStoreVisible) return null;

    return (
        <div className="modal text-center fixed inset-0 bg-black/75 flex justify-center items-center z-50" onClick={closeStore}>
            <div className="modal-content text-center bg-gray-900 p-6 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <span className="close-button" onClick={closeStore}>&times;</span>
                <div className='store text-center '>
                    {store.map((x) => (
                        <div className='inlinestore' key={x.storeID}>
                            <div className='flex w-full h-auto rounded-md mb-2'>
                                <img loading="lazy" className='store-pic' src={`https://www.cheapshark.com${x.images?.logo}`} alt={x.storeName} />
                                <p className='store-row'>{x.storeName}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
