const Chat = require('../model/Chat');
const Group = require('../model/Group'); // Import the Group model

exports.newGroup = async (req, res) => {
    const { group, participants, admin } = req.body;

    try {
        // Check if a group with the same name and admin already exists
        const existingGroup = await Group.findOne({ name: group, admin: admin });

        if (existingGroup) {
            console.log('Group already exists');
            return res.status(400).json({ message: 'Group already exists' });
        }

        // Create a new group with the provided data
        const newGroup = new Group({
            name: group,
            participants: participants, 
            admin: admin // Assuming admin ID is provided in the request body
        });

        // console.log(group, participants, admin);

        // Save the new group to the database
        const savedGroup = await newGroup.save();

        // Respond with success message and saved group data
        res.status(201).json({ message: 'Group created successfully', group: savedGroup });
    } catch (error) {
        // Handle errors
        console.error("Error creating group:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getGroup = async (req, res) => {
    // console.log(req.params.id,'info is');
    let string = req.params.id;
    if (string && string[0] === ':') {
        string = string.substring(1);

    }

    console.log('string is',string);
    
    try {
        const groups = await Chat.find({$and: [
            { isGroupChat: true }, // Find groups that are group chats
            {
                $or: [
                    { admin: string }, // Find groups where the provided string is the admin
                    { users: string } // Find groups where the provided string is a participant
                ]
            }
        ]}).populate('admin','name').populate('users','name');
        // console.log('groups are',groups);
        // console.log(groups.length)

        if (groups.length==0) {
            // No groups found, inform the client
            return res.status(404).json({ message: 'No groups found' });
        }
        
        // Groups found, send them back to the client
        return res.status(200).json({ message: 'Groups retrieved successfully', groups: groups });
        
    } catch (error) {
        // Log the error and inform the client
        console.error('Error fetching groups:', error);
        return res.status(500).json({ message: 'Server error while fetching groups' });
    }
};

exports.specificGroup=async(req,res)=>{
    console.log(req.params.groupId,'info is ');
    let string = req.params.groupId;
    const group=await Chat.findOne({_id:string}).populate('admin').populate('users');
    // console.log(group);
    if(!group)
    {console.log('group not found');
    return res.status(404).json({ message: 'No groups found' });
    }
    return res.status(200).json({ message: 'Groups retrieved successfully', groups: group });

}


exports.deleteUsers = async (req, res) => {
   
    // console.log(req.body);
    

    try {
        // Find the group by ID and populate admin and participants fields
        const group = await Chat.findOne({_id:req.body.group});
        // console.log('data is',group);
        // Check if the group exists
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        console.log('users ',group.users);
        // Remove participants from the group
        group.users = group.users.filter(participant => !req.body.users.includes(String(participant._id)));
        // console.log('user is',group.users);
        // // Save the updated group
        await group.save();

        // Populate admin and participants data before sending the response
        const updatedGroup = await Group.findById(group._id)
            .populate('admin', 'name _id')
            .populate('users', 'name _id');

        res.status(200).json({ message: 'Participants removed successfully', group: updatedGroup });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// const Group = require('../models/Group');

exports.addUsers = async (req, res) => {
    const { groupId, usersToAdd } = req.body;

    try {
        // Find the group by ID
        const group = await Chat.findById(groupId);
        
        // Check if the group exists
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        // Update the group's participants array with unique users
        const uniqueUsers = new Set(group.users.concat(usersToAdd));
        group.users= Array.from(uniqueUsers);

        // Save the updated group
        await group.save();
        console.log('group is ',group);
        // Populate admin and participants data before sending the response
        const populatedGroup = await Chat.findById(groupId)
            .populate('admin', 'name')
            .populate('users', 'name');
            console.log('new group',populatedGroup);
        res.status(200).json({ message: 'Users added to the group successfully', group: populatedGroup });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.LeaveGroup = async (req, res) => {
    const userId = req.body.userId;
    const groupId = req.body.groupId;

    try {
        // Find the group by ID
        const group = await Group.findOne({ _id: groupId });
        
        // If the group doesn't exist, return a 404 error
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        console.log(group.admin==userId);
        console.log(userId);
        // Check if the user is the admin of the group
        const isAdmin = group.admin == userId;

        if (isAdmin) {
            // If the user is the admin, delete the group and return a success message
            await Group.deleteOne({ _id: groupId });
            return res.status(200).json({ message: 'Group deleted successfully',group:{} });
        }

        // Check if the user is a member of the group
        const isMember = group.users.includes(userId);

        if (isMember) {
            // If the user is a member and there's only one participant (the user leaving),
            // delete the group
            if (group.users.length === 1) {
                await Group.deleteOne({ _id: groupId });
                return res.status(200).json({ message: 'Group deleted successfully',group:{} });
            } else {
                // If there are other participants, remove the user from the participants array
                group.participants = group.participants.filter(participantId => participantId !== userId);
                await group.save();
                return res.status(200).json({ message: 'User left the group successfully' });
            }
        } else {
            // If the user is neither the admin nor a member of the group, return an error message
            return res.status(404).json({ message: 'User is not a member of the group' });
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Error leaving the group:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
