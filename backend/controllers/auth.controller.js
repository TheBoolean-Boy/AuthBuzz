import bcryptjs from "bcryptjs";
import crypto from "crypto"

import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "../mailtrap/emails.js";


export const signup = async(req, res)=> {
  
  const {name, email, password} = req.body;
  try {
    if(!name || !email || !password){
      return res.status(400).json( {success:false, message:"All fields are required"} );
    }

    const userAlreadyExists = await User.findOne({email});
    if(userAlreadyExists){
      return res.status(400).json( {success:false, message:"Email already in use"} );
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
    })

    await newUser.save();

    //jwt
    generateTokenAndSetCookie(res,newUser._id);

    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user:{
        ...newUser._doc,
        password: undefined
      }
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message})
  }
}

export const verifiyEmail = async(req, res) => {
  const {code} = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() }
    })

    if(!user){
      return res.status(400).json({success: false, message: "Invalid or expired verification Code"})
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save()

    await sendWelcomeEmail(user.email, user.name);
    res.status(200).json({success: true, message: "Email verified successfully", 
      user:{
        ...user._doc,
        password: undefined
      }
    })
  } catch (error) {
    console.log("Couldn't verify your account", error);
    res.status(500).json({message: "something went wrong"})
  }
}

export const login = async(req, res)=> {
  const {email, password} = req.body;
  try {
    const user = await User.findOne({email})
    if(!user){
      return res.status(400).json({success: false, message: "Invalid credentials"})
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if(!isPasswordValid){
      return res.status(400).json({success: false, message: "Invalid credentials"})
    }

    await generateTokenAndSetCookie(res, user._id);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined
      }
    })

    
  } catch (error) {
    console.log("Error in loggin in ", error);
    res.status(500).json({success: false, message: error.message})
  }
}

export const logout = async(req, res) => {
  res.clearCookie("token");
  res.status(200).json({message: "Logged out successfully"});
}

export const forgotPassword = async(req, res) => {
  const{email} = req.body;
  try {
    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({success:false, message:"Email not found"})
    }
    

    //generate a restetToken
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenValidTill = Date.now() + 1 * 60 * 60 * 1000; //valid till next 1 hr

    user.resetPasswordToken = resetToken
    user.resetPasswordExpiresAt = resetTokenValidTill

    console.log(user)
    await user.save();

    // call send reset mail function

    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)

    res.status(200).json({success: true, message: "Password reset link sent to your email"})
  } catch (error) {
    console.log("Error resetting password", error);
    res.status(500).json({success:false, message: `${error.message}`})
  }
}

export const resetPassword = async(req, res) => {
  try{
    const {token} = req.params
    const {password} = req.body

    const user = User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now()}
    })

    if(!user){
      return res.status(400).json({success:false, message:"Invalid or expired reset token"})
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword
    user.resetPassword = undefined
    useReducer.resetPasswordExpiresAt =undefined

    await user.save();

    // send reset successful email

    await sendResetDoneEmail()
  }
  catch{

  }
}