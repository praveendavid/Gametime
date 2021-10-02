import React, { useEffect, useState } from "react";
import classnames from "classnames";
import axios from "axios";

const useSearch = (query) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);
    useEffect(() => {
        if (!query) return;
        setIsLoading(true);
        const timeOutId = setTimeout(() => fetchData(query), 500);
        return () => clearTimeout(timeOutId);
    }, [query]);

    const createJson = (data) => {
        let finalJson = [];
        let incomingData = JSON.parse(JSON.stringify(data));
        if (incomingData && incomingData.events && incomingData.events.length) {
            incomingData.events.forEach((element, i) => {
                if (i < 3) {
                    let obj = {};
                    obj['event'] = { 'img': element.performers[0].hero_image_url, 'name': element.event.name, 'subtitle': element.venue.name };
                    obj['venue'] = { 'img': element.venue.image_url, 'title': element.venue.name, 'subtitle': element.venue.city };
                    obj['performer'] = element.performers.map(m => { return { 'img': m.hero_image_url, 'title': m.name, 'subtitle': m.category } });
                    finalJson.push(obj);
                }
            });
            setIsLoading(false);
            setData(finalJson);
        }
    }

    const fetchData = () => {
        setData([]);
        let cancel;
        axios({
            method: "GET",
            url: "https://mobile-staging.gametime.co/v1/search",
            params: { q: query },
            cancelToken: new axios.CancelToken((c) => (cancel = c)),
        })
            .then((res) => {
                createJson(res.data);
            })
            .catch((e) => {
                if (axios.isCancel(e)) return;
            });
        return () => cancel();
    }
    return { data, isLoading };
}

const GameTime = () => {
    const [query, setQuery] = useState("");
    const { data, isLoading } = useSearch(query);

    const handleSearch = (e) => {
        const { value } = e.target;
        setTimeout(() => {
            if (value) setQuery(value);
        }, 500);
    }
    return (
        <>
            <h1>Game Time</h1>
            <div style={{ display: 'flex', justifyContent: 'center' }} className="wrapper">
                <div className="control">
                    <div className={classnames("control", { "is-loading": isLoading })} style={{ width: '500px' }}>
                        <input type="text" className="input" onChange={handleSearch} />
                    </div>
                    {data && data.length > 0 && !isLoading && (
                        <div className="list">
                            {data.map((i, index) => (
                                <div key={index} className="list-item">
                                    <div style={{ display: 'flex' }}><img style={{ height: '50px' }} src={i.event.img} /><div style={{ padding: '2px 16px' }}><h4>{i.event.name}</h4><p>{i.event.subtitle}</p></div></div><br />
                                    {i.performer.map((m, child) => (<div key={child + 10} style={{ display: 'flex' }}><img src={m.img} style={{ height: '50px' }} /><div style={{ padding: '2px 16px' }}><h4>{m.title}</h4><p>{m.subtitle}</p></div> </div>))}
                                    <div style={{ display: 'flex' }}><img style={{ height: '50px' }} src={i.venue.img} /><div style={{ padding: '2px 16px' }}><h4>{i.venue.title}</h4><p>{i.venue.subtitle}</p></div></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="list is-hoverable" />
            </div>
        </>
    );
}
export default GameTime;