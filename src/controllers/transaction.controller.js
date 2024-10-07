import { asyncHandler } from "../utils/asyncHandler.js";
import { Transaction } from "../models/transaction.model.js";
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

const listTransactions = asyncHandler(async (req, res)=>{
    const {page=1, perPage=10, search='', month} = req.query;

    const query = {};

})


export  {
    initDB,
}