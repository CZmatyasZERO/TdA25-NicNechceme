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
    admin: {
      type: Boolean,
      required: true,
      default: false,
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
      default: 400,
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
    banned: {
      type: Boolean,
      default: false,
    },
    findingRanked: {
      type: Boolean,
      default: false,
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
  return await bcrypt.compare(candidatePassword, this.password)
}

// Create the model
const User = mongoose.models.User || mongoose.model("User", UserSchema)

export default User
