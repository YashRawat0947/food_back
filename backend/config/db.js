import mongoose from 'mongoose'

let isConnected = false

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection')
        return
    }

    try {
        if (!process.env.MONGO_URL) {
            throw new Error('MONGO_URL environment variable is not defined')
        }

        const conn = await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000,
        })

        isConnected = conn.connections[0].readyState === 1
        console.log(`MongoDB Connected: ${conn.connection.host}`)

    } catch (error) {
        isConnected = false
        console.error('MongoDB connection error:', error.message)
        throw error // let the caller handle it instead of crashing the process
    }
}

export default connectDB