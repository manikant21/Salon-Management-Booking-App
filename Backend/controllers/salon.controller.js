import Salon from "../models/salon.model.js";
import Service from "../models/service.model.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, S3_BUCKET } from "../config/s3.config.js";
import { AWS_REGION } from "../config/server.config.js"


export const registerSalon = async (req, res, next) => {
    try {
        const { name, description, location, open_time, close_time, is_active } = req.body;
        const ownerId = req.owner.id;
        if (!req.file) {
            return res.status(400).json({ message: "No files uploaded" });
        }
        // console.log("manikant");
        // console.log(req.file);
        const key = `uploads/${Date.now()}-${req.file.originalname}`;


        await s3.send(
            new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            })
        );

        const fileUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

        const salon = await Salon.create({
            name,
            description,
            location,
            open_time,
            close_time,
            is_active,
            image: fileUrl,
            owner_id: ownerId
        });

        res.status(201).json({ message: "Salon created successfully", salon });



    } catch (err) {
        console.error("Error in registering salon:", err);
        next(err);
    }
}

export const getMyAllSalon = async (req, res, next) => {
    try {
        const salons = await Salon.findAll({
            where: { owner_id: req.owner.id },
            attributes: ["id", "name", "description", "location", "open_time", "close_time", "image", "is_active"],
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({ salons });
    } catch (err) {
        console.error("Error in fetching salon details:", err);
        next(err);
    }
}

export const getSalonDetails = async (req, res, next) => {
    try {
        const salonId = req.params.salonId;
        const salon = await Salon.findOne({
            where: {
                id: salonId
            }
        })
        res.status(200).json({ salon });
    } catch (error) {
        console.error("Error in fetching salon details:", err);
        next(err);
    }
}

export const addService = async (req, res, next) => {
    try {
        const { name, salonId, description, duration, price, open_time_for_services, close_time_for_services, is_active } = req.body;
        if (!name || !salonId || !duration) {
            return res.status(400).json({ message: "Fields are missing" });
        }
        const service = Service.create({
            service_name: name,
            description,
            salon_id: salonId,
            duration,
            price,
            open_time_for_services,
            close_time_for_services,
            is_active
        })
        res.status(200).json({ service });

    } catch (error) {
        console.error("Error in creating service for salon:", err);
        next(err);
    }
}

export const getServiceDetails = async (req, res, next) => {
    try {
        const salonId = req.params.salonId;
        const services = await Service.findAll({
            where: {
                salon_id: salonId
            }
        })
        res.status(200).json({ services });
    } catch (error) {
        console.error("Error in fegtching service details for salon:", err);
        next(err);
    }
}


export const deleteService = async (req, res, next) => {
    try {
        const serviceId = req.params.serviceId;
        const service = await Service.destroy({
            where: {
                id: serviceId
            }
        })
        res.status(200).json({ msg: "Service deleted successfully!" });
    } catch (error) {
        console.error("Error in deleteing service form salon:", err);
        next(err);
    }
}

export const getServiceDetailForEdit = async (req, res, next) => {
    try {
        const serviceId = req.params.serviceId;
        const service = await Service.findOne({
            where: {
                id: serviceId
            }
        })
        res.status(200).json({ service });
    } catch (error) {
        console.error("Error in deleteing service form salon:", err);
        next(err);
    }
}

export const updatedData = (req, res, next) => {
    try {
        const { name, salonId, description, duration, price, open_time_for_services, close_time_for_services, is_active } = req.body;
        const serviceId = req.params.serviceId;
        if (!name || !salonId || !duration) {
            return res.status(400).json({ message: "Fields are missing" });
        }
        const service = Service.update({
            service_name: name,
            description,
            salon_id: salonId,
            duration,
            price,
            open_time_for_services,
            close_time_for_services,
            is_active
        }, {
            where: {
                id: serviceId
            }
        })
        res.status(200).json({ service });

    } catch (err) {
        console.error("Error in deleteing service form salon:", err);
        next(err);
    }
}

export const deleteSalon =async (req, res, next) => {
    try {
        const salonId = req.params.salonId;
        const salon = await Salon.findOne({
            where: {
                id: salonId
            }
        })
        if( !salon) {
            return res.status(404).json({ error: "Salon not found" });
        }
        await Salon.destroy({
            where: {
                id: salonId
            }
        })
        res.status(200).json({ msg: "Salon deleted Successfully"});
    } catch (err) {
        console.error("Error in deleteing salon:", err);
        next(err);
    }
}

export const getSalonDetailForEdit = async (req, res, next) => {
    try {
        const salonId = req.params.salonId;
        const salon = await Salon.findOne({
            where: {
                id: salonId
            }
        })
         if( !salon) {
            return res.status(404).json({ error: "Salon not found" });
        }
        res.status(200).json({salon});
    } catch (err) {
        console.error("Error in  fetching salon detail for editing:", err);
        next(err);
    }
}

export const updateSalonData = async (req, res, next) => {
    try {
         const salonId = req.params.salonId;
        const { name, description, location, open_time, close_time, is_active } = req.body;
        // const ownerId = req.owner.id;
         const salon = await Salon.update({
            name,
            description,
            location,
            open_time,
            close_time,
            is_active
        },{
            where: {
                id: salonId
            }
        });

        res.status(201).json({salon });

    } catch (err) {
        console.error("Error in  updateing salon detail after editing:", err);
        next(err);
    }
}
