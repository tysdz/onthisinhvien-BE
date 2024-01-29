
const express = require('express');
const router =  express.Router()
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')

const verifyToken = require('../middleware/auth');
const User = require('../models/user')

// router.get('/', (req,res) => res.send('USER ROUTE'))
// post register
router.post('/register', async(req, res) => {
    const {username, password} = req.body
    console.log(req.body);

    if (!username || !password)
    return res.status(400).json({success: false, message: 'Missing Username or PassWord' })
    try{
        // check trung lap user
        const user = await User.findOne({ username })

        if (user)
        return res.status(400).json({success: false, message:"Username is existing"})
        
        const hashPassword = await argon2.hash(password)
        const newUser = new User({username, password : hashPassword})
        await newUser.save()

        const accessToken = jwt.sign({userId : newUser._id}, process.env.ACCSESS_TOKEN_SECRET 
        )

        res.json({success: true, message:'User create successful',newUser, accessToken})
    }catch(error){
        console.log(error)
        res.status(500).json({success:false, message:'Something went wrong!'})
    }
})


// post login
router.post('/login', async(req, res) => {
    const {username, password} = req.body

    if (!username || !password)
    return res.status(400).json({success: false, message: 'Missing Username or PassWord' })
    try{
        // kiem tra ton tai
        const user = await User.findOne({username})
        if(!user)
        return res.status(400).json({success: false, message:'Incorrect User'})

        const passwordValid = await argon2.verify(user.password, password)
        if(!passwordValid)
        return res.status(401).json({success: false, message:'Incorrect Password'})

        const accessToken = jwt.sign({userId : user._id}, process.env.ACCSESS_TOKEN_SECRET)
        res.json({success: true, message:'Login successful', accessToken, user})

    }catch(error){
        console.log(error)
        res.status(500).json({success:false, message:'Something went wrong!'})
    }
})


// change pass
// change password
router.put('/change-password/:userId', verifyToken, async (req, res) => {
  const userId = req.params.userId;
  const { currentPassword, newPassword } = req.body;
  
    try {
      console.log(req.body);

      const user = await User.findById(userId);
      const passwordValid = await argon2.verify(user.password, currentPassword);
      const hashPassword = await argon2.hash(newPassword);
      const updatedUser = await User.findByIdAndUpdate(req.params.userId,{ password: hashPassword },{ new: true });
      if (!passwordValid) 
        return res.status(400).json({ success: false, message: 'Incorrect current password' });
      if (!updatedUser)
        return res.status(401).json({ success: false, message: 'Something went wrong' });
  
      res.json({ success: true, message: 'Password updated successfully!', updatedUser });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Something went wrong!' });
    }
  });


module.exports = router