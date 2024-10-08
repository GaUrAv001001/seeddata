const apiCall = async (apiFunction, req) => {
    return new Promise((resolve, reject) => {
        // Temporary response object to capture and return the response data
        const tempRes = {
            json: (data) => {
                resolve(data); // Resolve with the JSON data from the API call
            },
            send: (data) => {
                resolve(data); // Resolve with the sent data from the API call
            },
            status: (statusCode) => {
                tempRes.statusCode = statusCode; // Capture status code
                return tempRes; // Allow chaining
            }
        };

        // Call the API function with the temporary response object
        apiFunction(req, tempRes, (err) => {
            if (err) {
                reject(err); // Reject on error
            }
        });
    });
};



export default apiCall;


