import express from "express";
import Thread from '../models/Thread.js';
import getOpenAIAPIResponse from '../utils/openai.js';
import getPerplexityAPIResponse from '../utils/perplexityai.js';
import getGeminiAPIResponse from '../utils/gemini.js';

const router = express.Router();

router.post("/test",async(req,res)=>{
    try{
        const thread = new Thread({
            threadId:"abc",
            title:"Testing New Thread2",
        })
        const response = await thread.save();
        res.send(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Failed to save in DB"});
    }
})

//get all threads
router.get("/thread",async(req,res)=>{
    try{
        const threads = await Thread.find({}).sort({updatedAt: -1});
        //descending order of updatedAt .... most recent data at the top
        res.json(threads);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Failed to fetch threads"})
    }
})

router.get("/thread/:threadId",async(req,res)=>{
    const {threadId} = req.params;
    try{
        const thread = await Thread.findOne({threadId});
        if(!thread){
            return res.status(404).json({error:"Thread not found"});
        }
        res.json(thread.messages);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Failed to fetch chat"});
    }
})


router.delete("/thread/:threadId",async(req,res)=>{
    const {threadId} = req.params;
    try{
        const deleteThread = await Thread.findOneAndDelete({threadId});
        if(!deleteThread){
            res.status(404).json({error:"Thread not found"});
        }
        res.status(200).json({success:"Thread deleted successfully"});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Failed to delete thread"});
    }
})

router.post("/chat",async(req,res)=>{
    const {threadId , message , models} = req.body;
    if( !threadId || !message){
        return res.status(400).json({error:"Required data not found"});
    }
    try{
        let thread = await Thread.findOne({threadId});
        if(!thread){
            //create a new thread in DB
            thread = new Thread({
                threadId,
                title:message,
                messages:[{role:"user" , content: message}]
            });
        }else{
            thread.messages.push({role:"user" , content: message})
        }

        // const assistantReply = await getPerplexityAPIResponse(message);
        // thread.messages.push({role:"assistant" , content:assistantReply});
        
        const [perplexityReply, openaiReply , geminireply] = await Promise.all([
            getPerplexityAPIResponse(message),
            getOpenAIAPIResponse(message),   // <-- your OpenAI function
            getGeminiAPIResponse(message)
        ]);

        if(models == "assistant-openai"){
           thread.messages.push(
            { role: "assistant-openai", content: "OPENAI: "+openaiReply }
           );
           res.json({
            replies: {
                openai: "OPENAI : "+openaiReply
            }
        }); 
        }
        else if(models == "assistant-perplexity"){
            thread.messages.push(
                { role: "assistant-perplexity", content: "PERPLEXITY: "+perplexityReply }
            );
            res.json({
            replies: {
                perplexity: "PERPLEXITY : "+perplexityReply,
            }
        }); 
        }
        else if(models == "assistant-gemini"){
            thread.messages.push(
                {role: "assistant-gemini", content: "GEMINI: "+geminireply}
            );
            res.json({
                replies:{
                    gemini: "GEMINI : "+geminireply,
                }
            })
        }
        else{
            thread.messages.push(
                { role: "assistant-openai", content: "OPENAI: "+openaiReply },
                { role: "assistant-gemini", content: "Gemini: "+geminireply},
                { role: "assistant-perplexity", content: "PERPLEXITY: "+perplexityReply },
            );
            res.json({
            replies: {
                openai: "OPENAI: "+openaiReply,
                gemini: "Gemini: "+geminireply,
                perplexity: "PERPLEXITY: "+perplexityReply,
            }
        });
        }

        // Save both replies in thread
        // thread.messages.push(
        //     { role: "assistant-perplexity", content: "PERPLEXITY: "+perplexityReply },
        //     { role: "assistant-openai", content: "OPENAI: "+openaiReply }
        // );

        thread.updatedAt = new Date();
        await thread.save();

        // res.json({reply: assistantReply});
        // res.json({
        //     replies: {
        //         perplexity: "PERPLEXITY : "+perplexityReply,
        //         openai: "OPENAI : "+openaiReply
        //     }
        // });
    }catch(err){
        console.log(err);
        res.status(500).json({error:"something went wrong"});
    }
})


export default router;