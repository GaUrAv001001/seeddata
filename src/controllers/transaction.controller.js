import { asyncHandler } from "../utils/asyncHandler.js";
import { Transaction } from "../models/transaction.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import axios from 'axios';


// Initializing the database using the data provided by third pary api;
const initDB = asyncHandler(async (req, res)=>{
    try{
        const {data} = await axios.get(process.env.THIRD_PARTY_API_URL);
        if(!data) {
            console.log("error fetching data !!");
        }
        await Transaction.insertMany(data);

        return res.status(200).json({message:'Databse initialize successfully with data', totalRecords:data.length,})
    } catch(error){
        return res.status(500).json({
            message: 'Failed to initialize the database',
            error: error.message,
        })
    }
})

// Api to list all transactions with pagination and search

// const listTransactions = asyncHandler(async (req, res)=>{
//     const {page=1, perPage=10, search='', month} = req.query;

//     const query = {};
//     const monthL = month ? month.toLowerCase() : month;

//     const test = await Transaction.find({
//         dateOfSale: {
//             $gte: new Date("2024-01-01T00:00:00.000Z"),
//             $lte: new Date("2024-01-31T23:59:59.999Z")
//         }
//     });

//     console.log("test: ", test);

//     if(monthL){
//         // const startDate = new Date(new Date().getFullYear(), new Date(Date.parse(month+' 1, 2000')).getMonth(), 1);
//         // const endDate = new Date(new Date().getFullYear(), new Date(Date.parse(month+' 1, 2000')).getMonth()+1, 0);
//         // query.dateOfSale = {$gte:startDate, $lte:endDate};

//         const monthIndex = new Date(Date.parse(monthL + ' 1, 2000')).getMonth(); // Get month index (0-11)
//         const startDate = new Date(Date.UTC(new Date().getFullYear(), monthIndex, 1)); // Start of the month in UTC
//         const endDate = new Date(Date.UTC(new Date().getFullYear(), monthIndex + 1, 0, 23, 59, 59)); // End of the month in UTC

//         console.log('Start Date:', startDate);
//         console.log('End Date:', endDate);
        
//         query.dateOfSale = { $gte: startDate, $lte: endDate };
//     }

//     if(search){
//         query.$or = [
//             {title: {$regex:search, $options:'i'}},
//             {description:{$regex:search, $options:'i'}},
//             {price:parseFloat(search)}
//         ]
//     }

//     const totalCount = await  Transaction.countDocuments(query);
//     console.log('query: ', query);

//     const transactions = await Transaction.find(query)
//             // .limit(Number(perPage))
//             // .skip((page-1)* perPage);
//     console.log('transactions: ', transactions);
    
//     return res.status(200).json({
//         page:Number(page),
//         perPage:Number(perPage),
//         totalCount:totalCount,
//         transactions,
//     })

// })

const listTransactions = asyncHandler(async (req, res) => {
    const { page = 1, perPage = 10, search = '', month } = req.query;

    const query = {};
    const normalizedMonth = month ? month.toLowerCase() : month;

    if (normalizedMonth) {
        const monthIndex = new Date(Date.parse(normalizedMonth + ' 1, 2000')).getMonth();

        // Using $expr to match transactions for the specified month regardless of the year
        query.$expr = {
            $and: [
                { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] }, // MongoDB months are 1-based
                { $gte: [{ $dayOfMonth: "$dateOfSale" }, 1] }, // Match day of month from 1
                { $lte: [{ $dayOfMonth: "$dateOfSale" }, 31] } // Match day of month up to 31
            ]
        };
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { price: parseFloat(search) }
        ];
    }

    const totalCount = await Transaction.countDocuments(query);

    // Fetch the transactions with pagination
    const transactions = await Transaction.find(query)
        .limit(Number(perPage))
        .skip((page - 1) * perPage);

    const totalPages = Math.ceil(totalCount/Number(perPage));

    // return res.status(200).json({
    //     page: Number(page),
    //     perPage: Number(perPage),
    //     totalCount: totalCount,
    //     totalPages:totalPages,
    //     transactions,
    // });

    const response = {
        page: Number(page),
        perPage: Number(perPage),
        totalCount: totalCount,
        totalPages:totalPages,
        transactions,
    }

    return res.status(200)
    .json(new ApiResponse(200, response, "transaction fetched successfully!"))
});





export  {
    initDB,
    listTransactions,
}