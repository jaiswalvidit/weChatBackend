const { response } = require("express");
const Conversation = require("../model/Conversations");
const Message = require("../model/Message");
const User = require("../model/User");
const jwt = require('jsonwebtoken');
const Chat = require("../model/Chat");
// const chat = require("../model/chat");

const addUser = async (request, response) => {
    try {
 
        const { email } = request.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return response.status(400).json({ error: 'User already exists' });
        }

        const newUser = new User(request.body);
        await newUser.save();

        return response.status(201).json(newUser); 
    } catch (error) {
        console.error('Error adding user:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
};
const getUser = async (request, response) => {
    console.log('it is called');
    try {
        const users = await User.find({});
        // console.log('users are',users);
        const message = "Users retrieved successfully";
        // console.log(users)
        
        if(response)
        return response.status(200).json({ message: message, users: users }); 
    } catch (error) {
        console.error('Error fetching users:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
const changeUser = async (req, res) => {
    try {
        console.log(req.body); // Log the request body to debug and see what is being passed
        const id = req.body.id; // Extract the user ID from the request body
        console.log(id);
        // Find the user by ID
        const exist = await User.findOne({_id: req.body.id});
        console.log(exist);
        if (!exist) {
            // If no user is found, send a 404 error
            return res.status(404).send('User not found');
        }
        
        // Update the user's picture
        exist.picture = req.body.picture;
        console.log('data',exist);
        // Save the updated user to the database
        await exist.save();
        return res.status(200).json({message:'successful',user:exist});
        // Send a success response back to the client
        res.send('User updated successfully');
    } catch (error) {
        // Handle any errors that might occur during the process
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }
};


const specificUser = async (request, response) => {
    const { id } = request.params; 
    try {
        const user = await User.findOne({ _id: id }); 
        return response.status(200).json(user); // Return user as JSON response
    } catch (error) {
        console.error('Error fetching user:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
};
const checkUser = async (req, res) => {
    const { email, password } = req.body;
    try {
       
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        return res.json({ success: true, message: 'Login successful', user });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const newChat = async (req, res) => {
    try {
        console.log(req.body,'hhhhhhhhhhhhhhhhhhh');
        const  { group, admin,users,isGroupChat} = req.body;
        console.log(isGroupChat)
        if (isGroupChat===true) {
            let exist = await Chat.findOne({group:group,isGroupChat:true});
            if (exist) {
                console.log("Chat already exists");
                // return res.status(400).json({ error: "Chat already exists" });
            }
            else 
            {let  newChat = await Chat.create(req.body);
            await newChat.save();
            }
            exist=await  Chat.findOne({group,isGroupChat:true}).populate('users',"name, picture").populate('admin',"name, picture");
            // console.log('group created');
            return res.status(200).json({message:'successful',newChat:exist});
        } else {
            let  exist = await Chat.findOne({ users: { $all: users },isGroupChat:false });
            if (exist) {
                console.log('Chat exists');
                // return res.status(400).json({ error: "Chat already exists" });
            }
            else 
            {
            let  newChat = await Chat.create({ users});
            await newChat.save();
            }
            exist= await Chat.findOne({ users: { $all: users },isGroupChat:false }).populate('users','name ,picture');
            return res.status(200).json({message:'successful',newChat:exist});
        }
    } catch (error) {
        console.error("Error creating new conversation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getChat = async (req, res) => {
    try {
        const id=req.body.id;
        // console.log(id,'id is');
        const chat = await Chat.findOne({_id:id}).populate(users).populate('messages');
        if (chat) {
            
            return res.status(200).json({ success: true, chat:chat });
        } else {
           
            return res.status(404).json({ success: false, message: "Chat not found" });
        }
    
    } catch (error) {
        // Handle errors
        console.error("Error in getConversation:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
const addMessage = async (req, res) => {
    // console.log(req.body); // Logging the request body to check the received data
    
    try {
        // Creating a new Message instance with the data from the request body
        const newMessage = new Message(req.body);
        // console.log('data is', newMessage); // Logging the new message data
        
        // Saving the new message to the database
        await newMessage.save();
        
        // Finding the conversation and updating its latestMessage field with the new message
        const conversation = await Chat.findOneAndUpdate(
            { _id: newMessage.messageId }, // Filter: Find the document by its _id
            { $set: { messages: newMessage } }, // Update: Set the latestMessage field to newMessage
            { new: true } // Options: Return the updated document
        ).populate('messages');
        
        
        // console.log('conversation is', conversation); // Logging the updated conversation
        
        // Finding the newly saved message
        const newMess = await Message.findOne({ _id: newMessage._id }).populate('messageId').populate('senderId');
        // console.log(newMess, 'message are as follows'); // Logging the newly saved message
        
        // Sending response with success message and the newly saved message
        return res.status(200).json({ message: 'Message sent successfully',message:newMess});
    } catch (error) {
        console.error('Error adding message:', error); // Logging any errors that occur
        return res.status(500).json({ error: 'Internal server error' }); // Sending 500 status for internal server error
    }
};

const getMessage = async (req, res) => {
    // console.log('required string is ', req.params.id);
    let string = req.params.id;
    if (string[0] === ':') {
        string = string.substring(1);
    }
    try {
        const messages = await Message.find({ mode: 'group', messageId: string }).populate('senderId');
        const messages2 = await Message.find({ mode: 'individual', messageId: string }).populate('senderId');
        
        // console.log(messages.length === 0);
        // console.log(messages2.length === 0);

        if (messages.length === 0 && messages2.length === 0)
            return res.status(200).json({ message: [] });

        if (messages.length === 0) {
            // console.log('individual messages are', messages2);
            return res.status(200).json({ message: messages2 });
        }

        if (messages2.length === 0) {
            // console.log("groups are received", messages);
            return res.status(200).json({ message: messages });
        }

        // console.log("No messages found");
        return res.status(404).json({ error: 'No messages found' });
    } catch (error) {
        console.error('Error getting conversation:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = { addUser, getUser, specificUser,changeUser, checkUser,newChat,getChat,addMessage,getMessage};
