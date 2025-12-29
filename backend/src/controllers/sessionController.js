import Session from "../models/Session.js";
import { chatClient, streamClient } from "../lib/stream.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerId = req.user.clerId;

    if (!problem || !difficulty) {
      return res
        .status(400)
        .json({ msg: "Problem and Difficulty is required" });
    }

    const callId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    const session = await Session.create({
      problem,
      difficulty,
      host: userId,
      callId,
    });

    // create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
        data:{
            created_by_id:clerId,
            custom: {problem, difficulty, sessionId: session._id.toString}
        }
    })

    // chat messaging
    const channel = chatClient.channel("messaging", callId, {
        name:`${problem} Session`,
        created_by_id:clerId,
        members:[clerId]
    })

    await channel.create()
    res.status(201).json({session})

  } catch (error) {
    console.log("Error in createSession controller: ", error.message);
    res.status(500).json({msg: "Internal Server Error"})
  }
}
export async function getActiveSessions(_, res) {
    try {
        const sessions = await Session.find({status: "active"})
        .populate("host","name profileImage emil clerkId")
        .sort({createdAt:-1})
        .limit(20);

        res.status(200).json({sessions})

    } catch (error) {
        console.log("Error in getActiveSessions controller: ", error.message);
        res.status(500).json({msg: "Internal Server Error"})
    }
}
export async function getMyRecentSessions(req, res) {
    try {
        const userId = req.user._id;

        await Session.find({status: "completed", $or: [{host:userId}, {participant:userId}]})
        .sort({createdAt:-1}).limit(20)
    } catch (error) {
        console.log("Error in getMyRecentSessions controller: ", error.message);
        res.status(500).json({msg: "Internal Server Error"})
    }
}
export async function getSessionById(req, res) {
    try {
        const {id} = req.params;
        const session = await Session.findById(id)
        .populate("host", "name email profileImage clerkId")
        .populate("participant", "name email profileImage clerkId")

        if(!session) return res.status(404).json({msg: "Session not found"})
        res.status(200).json({session})
    } catch (error) {
        console.log("Error in getSessionById controller: ", error.message);
        res.status(500).json({msg: "Internal Server Error"})
    }
}
export async function joinSession(req, res) {
    try {
        const {id} = req.params
        const userId = req.user._id
        const clerkId = req.user.clerkId

        const session = await Session.findById(id)

        if(!session) return res.status(400).json({msg: "Session not found"})

        // check if session is already full
        if(session.participant) return res.status(404).json({msg:"Session is full"})

        session.participant = userId
        await session.save()

        const channel = chatClient.channel("messaging",session.callId)
        await channel.addMembers([clerkId])

        res.status(200).json({session})
    } catch (error) {
        console.log("Error in joinSession controller: ", error.message);
        res.status(500).json({msg: "Internal Server Error"})
    }
}
export async function endSession(req, res) {
    try {
        const {id} = req.params
        const userId = req.user._id;

        const session = await Session.findById(id)

        if(!session) return res.status(400).json({msg: "Session not found"})

        // check if user is host
        if(session.host.toString() !== userId.toString()) return res.status(403).json({msg: "Only the host can end the session"})
        // check if session is already completed 
        if(session.status === "completed") return res.status(403).json({msg: "Session is already completed"})

        session.status = "completed"
        await session.save()

        // delete stream video call
        const call = streamClient.video.call("default", session.callId)
        await call.delete({hard:true})

        // delete stream chat channel
        const channel = chatClient.channel("messaging", session.callId)
        await channel.delete({hard:true})

        res.status(200).json({session})
    } catch (error) {
        console.log("Error in endSession controller: ", error.message);
        res.status(500).json({msg: "Internal Server Error"})
    }
}
