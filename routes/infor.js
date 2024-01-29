const express = require('express');
const router = express.Router();

const Infor = require('../models/infor');
const verifyToken = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  const { nameUser, email, phoneNumber } = req.body;
  const userId = req.userId;

  try {
    const newInfor = new Infor({nameUser,email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,phoneNumber,user: userId});

    await newInfor.save();

    res.json({ success: true, message: 'Update success', newInfor });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
  }
});

//// get infor
router.get('/', verifyToken, async(req, res) =>{
    try{
        const infors = await Infor.find({user: req.userId}).populate('user',['username'])
        res.json({success:true, infors})
    }catch(error){
        console.log(error);
        res.status(500).json({ success: false, message: 'Something went wrong!' });
    }
})

///// update infor 
router.put('/:id', verifyToken, async(req,res) =>{
    const { nameUser, email, phoneNumber } = req.body;

    try {
        let updateInfor = {nameUser : nameUser || '',
        email: (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined) || '',
        phoneNumber: phoneNumber || ''}

        const inforUpdateCondition = {_id: req.params.id, user: req.userId}
        updateInfor = await Infor.findOneAndUpdate(inforUpdateCondition, updateInfor, {new:true})

        /// user not authorissed to updatr
        if(!updateInfor)
        return res.status(401).json({success: false, message:'Something went wrong'})

        res.json({success:true, message:'Successful!', updateInfor})
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Something went wrong!' });
    }
})


/////// delete infor 
router.delete('/:id', verifyToken, async (req, res) => {
	try {
		const inforDeleteCondition = { _id: req.params.id, user: req.userId }
		const deletedInfor = await Infor.findOneAndDelete(inforDeleteCondition)

		// User not authorised or post not found
		if (!deletedInfor)
			return res.status(401).json({
				success: false,
				message: 'Post not found or user not authorised'
			})

		res.json({ success: true, post: deletedInfor })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Something went wrong!' });
    }
})

module.exports = router;