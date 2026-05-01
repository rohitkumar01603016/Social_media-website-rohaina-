const User = require("../../Schema/User");


const read = (req,res,next)=>{
    const profile =
      typeof req.profile?.toObject === "function"
        ? req.profile.toObject()
        : { ...req.profile };

    delete profile.password;
    res.json(profile)

}

module.exports=read
