const User = require('../../Schema/User')


const findpeople = async(req,res)=>{
const following = [...req.profile.following, req.profile._id]
try {    
    let users =  await User.find({_id : {$nin : following}}).select('name')
    res.json(users)
} catch (error) {
    return res.status(400).json({
      error: error.message || "Could not load suggested people"
    })
}
  
   


}

module.exports = findpeople
