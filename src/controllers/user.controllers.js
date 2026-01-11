import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErrorHandler.js";
import { User } from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import {ApiResposeHandler} from "../utils/ApiResposeHandler.js";

const registerUser = asyncHandler(async (req, res) => {

    const {fullname, email, username, password} = req.body
    
    if(
        [fullname, email, username, password].some((fields)=>{
            fields?.trim() === ""
        }) 
    ){
        throw new ApiError(400, "All field are required !")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email and username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0) {
            overImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avtar is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avtar is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken",
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong, while creating user")
    }

    return res.status(201).json(
        new ApiResposeHandler(200, "User registered successfully", createdUser)
    )
})

export {registerUser}