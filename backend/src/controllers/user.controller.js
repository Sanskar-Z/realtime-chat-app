import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler( async (req, res) => {
    //get user details from frontend
    //validation not empty
    // check if user already exist or not: username or email
    //create user object in db
    // remove passwaord and refreshtoken from response
    // check user creation      
    //send response

    const {fullName, email, username, password} = req.body

    if (
        [fullName, email, username, password].some((field) => {field?.trim() === ""})
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check username or emial
    const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })

    if (existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }


    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    )
})


const loginUser = asyncHandler( async (req, res) => {
// TODOS
    // req body -> data
    // check username or email
    // find the user
    // check password
    // generate access and refresh token
    // send cookies

    const {username, email, password} = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    // Here is an altermative of above code based on logic discussed in video:
    // if (!(username || email)){
    //      throw new ApiError(400, "username or email is required")
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken")


    // neccessary when using cookies
    // to send cookies
    const options = {
        httpOnly: true,           
        secure: true
    }      // if these fields are true then cookies are only modifiable from server and not from frontend
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})


const logoutUser = asyncHandler( async (req, res) => {
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:  {
                refreshToken: undefined 
            }
        },
        {
            // using new: true when we return a response res we get new updated value
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out")
    )

})

export { 
    registerUser,
    loginUser,
    logoutUser 
}