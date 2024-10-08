import { asyncHandler } from "../utils/asyncHandler.js";
import { Transaction } from "../models/transaction.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import apiCall from "../middleware/apiCall.middleware.js";
import ApiError from "../utils/ApiError.js";
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

        query.$expr = {
            $and: [
                { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] }, 
                { $gte: [{ $dayOfMonth: "$dateOfSale" }, 1] },
                { $lte: [{ $dayOfMonth: "$dateOfSale" }, 31] }
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
const getStatistics = asyncHandler(async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json(new ApiResponse(400, {}, "Month parameter is required"));
    }

    const normalizedMonth = month.toLowerCase();

    const monthIndex = new Date(Date.parse(normalizedMonth + ' 1, 2000')).getMonth() + 1; // MongoDB months are 1-based

    const query = {
        $expr: {
            $and: [
                { $eq: [{ $month: "$dateOfSale" }, monthIndex] }, 
                { $gte: [{ $dayOfMonth: "$dateOfSale" }, 1] }, 
                { $lte: [{ $dayOfMonth: "$dateOfSale" }, 31] }
            ]
        }
    };


    const totalSoldItems = await Transaction.countDocuments({ sold: true, ...query });

    const totalNotSoldItems = await Transaction.countDocuments({
        sold: false,
        ...query
    });


    const totalSalesAmount = await Transaction.aggregate([
        { $match: { sold: true, ...query } },
        { $group: { _id: null, total: { $sum: "$price" } } }
    ]);


    const response = {
        totalSoldItems,
        totalNotSoldItems,
        totalSalesAmount: totalSalesAmount.length > 0 ? totalSalesAmount[0].total : 0,
    };

    return res.status(200).json(new ApiResponse(200, response, "Statistics fetched successfully!"));
});


// Api for bar chart
const getDataForBarChart = asyncHandler(async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json(new ApiResponse(400, {}, "Month parameter is required"));
    }

    const normalizedMonth = month.toLowerCase();
    const monthIndex = new Date(Date.parse(normalizedMonth + ' 1, 2000')).getMonth() + 1;
    const query = {
        $expr: {
            $and: [
                { $eq: [{ $month: "$dateOfSale" }, monthIndex] }, 
                { $gte: [{ $dayOfMonth: "$dateOfSale" }, 1] }, 
                { $lte: [{ $dayOfMonth: "$dateOfSale" }, 31] }
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

    // Using Promise.all to count transactions for each price range
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

// Api for pie chart
const getPieChartData = asyncHandler(async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json(new ApiResponse(400, {}, "Month parameter is required"));
    }

    const normalizedMonth = month.toLowerCase();
    const monthIndex = new Date(Date.parse(normalizedMonth + ' 1, 2000')).getMonth() + 1; // MongoDB months are 1-based

    const query = {
        $expr: {
            $and: [
                { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
                { $gte: [{ $dayOfMonth: "$dateOfSale" }, 1] },
                { $lte: [{ $dayOfMonth: "$dateOfSale" }, 31] }
            ]
        }
    };

    const result = await Transaction.aggregate([
        { $match: query }, 
        { 
            $group: { 
                _id: "$category", 
                count: { $sum: 1 }
            }
        },
        { 
            $project: { 
                categoryName: "$_id", 
                count: 1, 
                _id: 0 
            } 
        }
    ]);

    return res.status(200).json(new ApiResponse(200, result, "Data for pie chart fetched successfully!"));
});


// Api to fetch data from all three api
const combinedResponse = async (req, res) => {
    try {
        const { month } = req.query;

        const [statistics, barChart, pieChart] = await Promise.all([
            apiCall(getStatistics, req),
            apiCall(getDataForBarChart, req),
            apiCall(getPieChartData, req),
        ]);

        const combinedData = {
            statistics: statistics.data,
            barChart: barChart.data,
            pieChart: pieChart.data
        };

        if(!combinedData){
            throw new ApiError(404, "No data available for combined api response")
        }

        return res.status(200).json(
            new ApiResponse(200, combinedData, "Combined response fetched successfully")
        );
    } catch (error) {
        console.error("Error in combinedResponse:", error);
        return res.status(500).json(new ApiResponse(500, {}, "An error occurred"));
    }
};


export  {
    initDB,
    listTransactions,
    getStatistics,
    getDataForBarChart,
    getPieChartData,
    combinedResponse,
}