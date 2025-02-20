import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcrypt"

const UserSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: uuidv4,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    elo: {
      type: Number,
      required: true,
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    draws: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id
        delete ret.__v
        delete ret.id
        delete ret.password
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id
        delete ret.__v
        delete ret.id
      },
    },
    virtuals: {},
  },
)

// Hash the password
UserSchema.pre("save", async function (next) {
  const user = this
  if (!user.isModified("password")) return next()

  user.password = await bcrypt.hash(user.password, 10)
  next()
})

// Password verification method
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Create the model
const User = mongoose.models.User || mongoose.model("User", UserSchema)

export default User
