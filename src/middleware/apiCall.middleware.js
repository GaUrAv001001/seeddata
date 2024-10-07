// const apiCall = async(apiFunction, req, res)=>{
//     return new Promise((resolve, reject)=>{
//         apiFunction(req, res, (err)=>{
//             if(err){
//                 reject(err);
//             }else{
//                 resolve(res.locals.data)
//             }
//         })
//     })
// }

// export default apiCall;


// const apiCall = async (apiFunction, req, res) => {
//     return new Promise((resolve, reject) => {
//         // Create a temporary response object to capture data
//         const tempRes = {
//             locals: {}, // To store response data
//             status: (statusCode) => {
//                 tempRes.statusCode = statusCode; // Capture status code
//                 return tempRes; // Allow chaining
//             },
//             json: (data) => {
//                 tempRes.locals.data = data; // Capture JSON data
//                 resolve(tempRes.locals.data); // Resolve the data
//             },
//             send: (data) => {
//                 tempRes.locals.data = data; // Capture send data
//                 resolve(tempRes.locals.data); // Resolve the data
//             }
//         };

//         // Call the API function with the temporary response object
//         apiFunction(req, tempRes, (err) => {
//             if (err) {
//                 reject(err); // Reject on error
//             }
//         });
//     });
// };

// export default apiCall;



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


