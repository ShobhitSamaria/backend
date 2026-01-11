import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErrorHandler.js";
import { User } from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import {ApiResposeHandler} from "../utils/ApiResposeHandler.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return{accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, " Something went wrong while generating token");
    }
}

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

const loginUser = asyncHandler(async (req,res)=>{
    const {username, email, password} = req.body

    if(!username && !email){
        throw new ApiError(400, "Usernam or Email required !!")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User doesn't exits")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid user")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    const options = {
        httpOnly : true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken, options)
    .json(
        new ApiResposeHandler(200,
            "User Logged in Successfylly !!!",
            {
                user: loggedInUser, accessToken, refreshToken
            })
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }
    )

    const options = {
        httpOnly : true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken",options)
    .json(new ApiResposeHandler(200, "User logout successfully !!!",{}))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshAccessToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request !!");   
    }

    try{
            const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
            const user = await User.findById(decodedToken?._id)

            if(!user){
                throw new ApiError(401, "Invalid refresh Token");   
            }

            if(incomingRefreshToken !== user?.refreshToken){
                throw new ApiError(401, "Refresh Token is expired")
            }

            const options = {
                httpOnly : true,
                secure: true
            }

            const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)


            return res.status(200)
            .cookie("accessToken",accessToken, options)
            .cookie("refreshToken",refreshToken, options)
            .json(
                new ApiResposeHandler(200,
                    "User Logged in Successfylly !!!",
                    {
                        accessToken, refreshToken
                    })
            )
    } catch (error){
        throw new ApiError(401, "Invalid Refresh Token !!")
    }
})

export {registerUser, loginUser, logoutUser, refreshAccessToken}