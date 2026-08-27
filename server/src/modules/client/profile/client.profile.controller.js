const userModel = require('../../../models/user.model');

const getProfile = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user.id)
            .select("-loginOTP -loginOTPExpiry -refreshToken -__v");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const shippingAddresses = user.addresses.filter(a => a.type === "shipping");
        const billingAddresses  = user.addresses.filter(a => a.type === "billing");

        const defaultShipping = shippingAddresses.find(a => a.isDefault);
        const defaultBilling  = billingAddresses.find(a => a.isDefault);

        return res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                shipping: {
                    default: defaultShipping,
                    history: shippingAddresses
                },
                billing: {
                    default: defaultBilling,
                    history: billingAddresses
                },
                isActive: user.isActive,
                isInCart: user.isInCart,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateCustomerInfo = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const addressId = req.query.addressId;
        // console.log(addressId)
        const { firstName, lastName, email, street, city, state, pincode } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (firstName || email) {
            const nameRegex = /^[a-zA-Z\s]{1,30}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (firstName) {
            if (!nameRegex.test(firstName)) {
            return res.status(400).json({ error: "Only alphabets and spaces are allowed" });
        }
        }
        if (email) {
            if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Enter valid email id" });
        }
        }
   
        if (firstName || lastName || email) {
            const editedInfo = await userModel.findByIdAndUpdate(
            {_id:userId},
            { firstName, lastName, email },
            { new: true }
        );
            
            return res.status(200).json({
            message: "User Info updated successfully",
            data: {
                _id: editedInfo._id,
                firstName: editedInfo.firstName,
                lastName: editedInfo.lastName,
                email: editedInfo.email,
                phone: editedInfo.phone,
                role: editedInfo.role,
                addresses: editedInfo.addresses,
                isActive: editedInfo.isActive,
                isInCart: editedInfo.isInCart,
                createdAt: editedInfo.createdAt,
                lastLogin: editedInfo.lastLogin
            }
        });
        }}
        else {
        //     let addressType = null;

        // if (user.addresses.shippingAddress && user.addresses.shippingAddress._id.toString() === addressId) {
        //         addressType = "shippingAddress";
        // } else if (user.addresses.billingAddress && user.addresses.billingAddress._id.toString() === addressId) {
        //         addressType = "billingAddress";
        // }

        // if (!addressType) {
        //     return res.status(404).json({ message: "Address not found" });
            // }
            const address = user.addresses.find(a => a._id.toString() === addressId);
            if (!address) return res.status(404).json({ message: "Address not found" });

        const updateFields = {};
        if (street) updateFields[`addresses.$.street`] = street;
        if (city) updateFields[`addresses.$.city`] = city;
        if (state) updateFields[`addresses.$.state`] = state;
        if (pincode) updateFields[`addresses.$.pincode`] = pincode;
        if (street || city || state || pincode) {
            const editedInfo = await userModel.findOneAndUpdate(
                { _id: userId, "addresses._id": addressId },
                { $set: updateFields },
                {new: true}
            )
            
            return res.status(200).json({
            message: "User Info updated successfully",
            data: {
                _id: editedInfo._id,
                firstName: editedInfo.firstName,
                lastName: editedInfo.lastName,
                email: editedInfo.email,
                phone: editedInfo.phone,
                role: editedInfo.role,
                addresses: editedInfo.addresses,
                isActive: editedInfo.isActive,
                isInCart: editedInfo.isInCart,
                createdAt: editedInfo.createdAt,
                lastLogin: editedInfo.lastLogin
            }
        });
        }}

    } catch (error) {
        res.status(500).json({
            message: "Error updating user info",
            error: error.message
        });
    }
};

const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        // console.log(addressId)
        const { type, fullName, alternatePhone,addressLine1, street, city, state, pincode, country,isDefault } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent duplicate address of same type with same details
        const existing = user.addresses.find(
            a =>
                a.type === type &&
                a.addressLine1 === addressLine1 &&
                a.city === city &&
                a.state === state &&
                a.pincode === pincode
        );
        if (existing) {
            return res.status(400).json({ message: `This ${type} address already exists.` });
        }

        const address = {
                type,
                fullName,
                phone: user.phone,
                alternatePhone,
                addressLine1,
                street,
                city,
                state,
                pincode,
                country,
                isDefault: isDefault || false
            
        }
        await userModel.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { new: true },
        );
        res.status(200).json({
            "success":true,
            message:`${type} address added successfully.`
        })

    } catch (error) {
        res.status(500).json({
            message: "Error at adding address in user profile",
            error: error.message
        });
    }
}

const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const {addressId }= req.params; 
        const user = await userModel.findById(userId); // Fixed from { _id: userId } to just userId
        if (!user) {
            return res.status(400).json({ message: "User Profile not found" });
        }
    //     let addressType = null;

    //     if (user.addresses.shippingAddress && user.addresses.shippingAddress._id.toString() === addressId) {
    //         addressType = "shippingAddress";
    //     } else if (user.addresses.billingAddress && user.addresses.billingAddress._id.toString() === addressId) {
    //         addressType = "billingAddress";
    //     }

    //     if (!addressType) {
    //         return res.status(404).json({ message: "Address not found" });
    //     }

    // // Unset the chosen address
    //     const updatedUser = await userModel.findByIdAndUpdate(
    //         userId,
    //         { $unset: { [`addresses.${addressType}`]: "" } },
    //         { new: true }
    //     );
        
const address = user.addresses.find(a => a._id.toString() === addressId);
if (!address) return res.status(404).json({ message: "Address not found" });

const updatedUser = await userModel.findByIdAndUpdate(
  userId,
  { $pull: { addresses: { _id: addressId } } },
  { new: true }
);
        res.status(200).json({ message: "Address deleted successfully!" });
    } catch (error) {
        res.status(500).json({
            message: "Error during deleting the address",
            error: error.message
        });
    }
}

const profileDelete = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await userModel.findById(userId); // Fixed from { _id: userId } to just userId
        if (!user) {
            return res.status(400).json({ message: "User Profile not found" });
        }

        user.isActive = false;
        await user.save();

        res.status(200).json({ message: "User Profile deleted successfully!" });
    } catch (error) {
        res.status(500).json({
            message: "Error during deleting the profile",
            error: error.message
        });
    }
};

module.exports = { getProfile, updateCustomerInfo, addAddress, profileDelete, deleteAddress };
