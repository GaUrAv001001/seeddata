const apiCall = async (apiFunction, req) => {
    return new Promise((resolve, reject) => {
        const tempRes = {
            json: (data) => {
                resolve(data); 
            },
            send: (data) => {
                resolve(data); 
            },
            status: (statusCode) => {
                tempRes.statusCode = statusCode; 
                return tempRes;
            }
        };

        apiFunction(req, tempRes, (err) => {
            if (err) {
                reject(err); 
            }
        });
    });
};



export default apiCall;


