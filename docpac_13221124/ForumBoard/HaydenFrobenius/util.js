function addParamsToURL(urlString, params){

    let url = new URL(urlString);
    let urlParams = url.searchParams;

    for (const [key, value] of Object.entries(params)) {
        if (!urlParams.has(key)) {
            urlParams.append(key, value);
        } else if(urlParams.has(key)){
            urlParams.set(key, value);
        }
    }

    return url.toString();
}

module.exports = {
    addParamsToURL
}