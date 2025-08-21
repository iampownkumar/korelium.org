// model importing 
const { where } = require('sequelize');
const {localAdmin}=require('../models');
const bcrypt=require('bcrypt');

const createLocalAdmin = async (req , res )=>{
    try{
        const {name,email,password,role}=req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({message:"All feilds are required"});
        }
        
        const exsitingLocalAdmin=await localAdmin.findOne({
            where: {email}
        });
        if (exsitingLocalAdmin) {
            return res.status(409).json({message:"User already exisit   "})
        }

        //password encryption is hapening here before creating the localadminuser
        const saltRounds=10;
        const hashedPassword=await bcrypt.hash(password,saltRounds); // this will create the hased password 
        
        
        const newLocalAdmin=await localAdmin.create({
            name,
            email,
            password:hashedPassword,
            role
        });
        res.status(201).json({message:"Local Admin User created succesfully",
                LocalAdmin:{
                    id:newLocalAdmin.id,
                    email:newLocalAdmin.email,
                    // password:newLocalAdmin.password,
                    role:newLocalAdmin.role
                }
                
        });
    }catch(err){
        return res.status(500).json({message:"Server Error"});
    }
};

module.exports={
    createLocalAdmin
}