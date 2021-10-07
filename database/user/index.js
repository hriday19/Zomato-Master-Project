import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


//Schema
const userSchema = new mongoose.Schema({

  fullname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  address: [{ details: { type: String }, for: { type: String } }],
  phoneNumber: [{ type: Number }],

},
  {
    timestamps: true,
  }
);


//


userSchema.methods.generateJwtToken = function(){

  return  jwt.sign({user: this._id.toString() },"ZomatoApp");
}


//static functoin
userSchema.statics.findByEmailAndPhone = async({email,phoneNumber})=>{
  const checkUserEmail = await UserModel.findOne({ email });
  const checkUserPhone = await UserModel.findOne({ phoneNumber });

  if(checkUserEmail || checkUserPhone){
  throw new Error("user ALready Exist");
}

return false;
};


userSchema.statics.findByEmailAndPassword = async({email,password})=>{
   
     const user = await UserModel.findOne({email});
     if(!user) throw new Error ("user  does no exist");

     //compare password
     const doesPasswordMatch = await bcrypt.compare(
       password,
       user.password
     )
     if(!doesPasswordMatch) throw new Error("invalid password");

     return user;

     
};

userSchema.pre("save", function (next){
     
      const user = this;
      
      if(!user.isModified("password")) return next();

      bcrypt.genSalt(8, (error,salt)=>{

        if(error) next(error);
    
        bcrypt.hash(user.password, salt, (error,hash)=>{
          if(error) return next(error)
          user.password = hash;
          return next();
        });
      });
});

//model
export const UserModel = mongoose.model("Users", userSchema);