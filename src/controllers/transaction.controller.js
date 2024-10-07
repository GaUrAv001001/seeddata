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



// Api for statisticts
// const getStatistics = asyncHandler(async(req, res)=>{
//     const {month} = req.query;

//     // const startDate = new Date(new Date().getFullYear(), new Date(Date.parse(month+' 1, 2000')).getMonth(),1)
//     // const endDate = new Date(new Date().getFullYear(), new Date(Date.parse(month+' 1, 2000')).getMonth()+1, 0);

//     const startDate = new Date(new Date().getFullYear(), new Date(Date.parse(month + ' 1, 2000')).getMonth(), 1);
//     const endDate = new Date(new Date().getFullYear(), new Date(Date.parse(month + ' 1, 2000')).getMonth() + 1, 0, 23, 59, 59);

//     const totalSoldItems = await Transaction.countDocuments({sold:true, dateOfSale:{$gte:startDate, $lte:endDate}});
//     const totalNotSoldItems = await Transaction.countDocuments({sold:false, dateOfSale:{$gte:startDate, $lte:endDate}})

//     const totalSalesAmount = await Transaction.aggregate([
//         {$match:{sold:true, dateOfSale:{ $gte: startDate, $lte: endDate }}},
//         {$group:{_id:null, total:{$sum:"$price"}}}
//     ])

//     const response = {
//         totalSoldItems,
//         totalNotSoldItems,
//         totalSalesAmount: totalSalesAmount.length > 0 ? totalSalesAmount[0].total : 0,
//     }

//     return res.status(200)
//     .json(new ApiResponse(200, response, ""))
// })

const getStatistics = asyncHandler(async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json(new ApiResponse(400, {}, "Month parameter is required"));
    }

    const normalizedMonth = month.toLowerCase();
    // console.log("Normalized month:", normalizedMonth);

    const monthIndex = new Date(Date.parse(normalizedMonth + ' 1, 2000')).getMonth() + 1; // MongoDB months are 1-based
    // console.log("monthIndex (1-based): ", monthIndex);

    // Create a query object
    const query = {
        $expr: {
            $and: [
                { $eq: [{ $month: "$dateOfSale" }, monthIndex] }, // Match month
                { $gte: [{ $dayOfMonth: "$dateOfSale" }, 1] }, // Match day from 1
                { $lte: [{ $dayOfMonth: "$dateOfSale" }, 31] } // Match day up to 31
            ]
        }
    };


    // Count total sold items
    const totalSoldItems = await Transaction.countDocuments({ sold: true, ...query });
    // console.log("totalSoldItems->", totalSoldItems);

    // Count total not sold items
    const totalNotSoldItems = await Transaction.countDocuments({
        sold: false,
        ...query
    });
    
    // console.log("totalNotSoldItems->", totalNotSoldItems);

    // Aggregate total sales amount for sold items
    const totalSalesAmount = await Transaction.aggregate([
        { $match: { sold: true, ...query } },
        { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    console.log("Total Sales Amount:", totalSalesAmount);

    const response = {
        totalSoldItems,
        totalNotSoldItems,
        totalSalesAmount: totalSalesAmount.length > 0 ? totalSalesAmount[0].total : 0,
    };

    return res.status(200).json(new ApiResponse(200, response, "Statistics fetched successfully!"));
});


// Api for bar chart

// const getDataForBarChart = asyncHandler(async(req, res)=>{
//     const {month} = req.query;

//     if (!month) {
//         return res.status(400).json(new ApiResponse(400, {}, "Month parameter is required"));
//     }

//     const normalizedMonth = month.toLowerCase();
//     // console.log("Normalized month:", normalizedMonth);

//     const monthIndex = new Date(Date.parse(normalizedMonth + ' 1, 2000')).getMonth() + 1; // MongoDB months are 1-based
//     // console.log("monthIndex (1-based): ", monthIndex);

//     // Create a query object
//     const query = {
//         $expr: {
//             $and: [
//                 { $eq: [{ $month: "$dateOfSale" }, monthIndex] }, // Match month
//                 { $gte: [{ $dayOfMonth: "$dateOfSale" }, 1] }, // Match day from 1
//                 { $lte: [{ $dayOfMonth: "$dateOfSale" }, 31] } // Match day up to 31
//             ]
//         }
//     };

//     const priceRanges = [
//         { min: 0, max: 100 },
//         { min: 101, max: 200 },
//         { min: 201, max: 300 },
//         { min: 301, max: 400 },
//         { min: 401, max: 500 },
//         { min: 501, max: 600 },
//         { min: 601, max: 700 },
//         { min: 701, max: 800 },
//         { min: 801, max: 900 },
//         { min: 901, max: Infinity }
//     ];

//     const result = await Promise.all(priceRanges.map(async (range)=>{
//         const count = await Transaction.countDocuments({
//             price:{$gte:range.min, $lte:range.max},
//             dateOfSale:{$gte:startDate, $lte:endDate}
//         })
//         return {range: `${range.min}-${range.max}`, count};
//     }))

//     res.status(200)
//     .json(new ApiResponse(200, result, "data for bar chart fetched succussfully!"))

// })

const getDataForBarChart = asyncHandler(async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json(new ApiResponse(400, {}, "Month parameter is required"));
    }

    const normalizedMonth = month.toLowerCase();
    const monthIndex = new Date(Date.parse(normalizedMonth + ' 1, 2000')).getMonth() + 1; // MongoDB months are 1-based

    // Create a query object to match transactions for the specified month
    const query = {
        $expr: {
            $and: [
                { $eq: [{ $month: "$dateOfSale" }, monthIndex] }, // Match month
                { $gte: [{ $dayOfMonth: "$dateOfSale" }, 1] }, // Match day from 1
                { $lte: [{ $dayOfMonth: "$dateOfSale" }, 31] } // Match day up to 31
            ]
        }
    };

    const priceRanges = [
        { min: 0, max: 100 },
        { min: 101, max: 200 },
        { min: 201, max: 300 },
        { min: 301, max: 400 },
        { min: 401, max: 500 },
        { min: 501, max: 600 },
        { min: 601, max: 700 },
        { min: 701, max: 800 },
        { min: 801, max: 900 },
        { min: 901, max: Infinity }
    ];

    // Use Promise.all to count transactions for each price range
    const result = await Promise.all(priceRanges.map(async (range) => {
        const count = await Transaction.countDocuments({
            price: { $gte: range.min, $lte: range.max },
            ...query
        });
        return { range: `${range.min}-${range.max}`, count };
    }));

    return res.status(200)
        .json(new ApiResponse(200, result, "Data for bar chart fetched successfully!"));
});




export  {
    initDB,
    listTransactions,
    getStatistics,
    getDataForBarChart,
}