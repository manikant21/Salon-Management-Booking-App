import Specialization from "../models/specialization.model.js";


export const addSpecialization = async(req, res, next) => {
    try {
        const {name, salonId} = req.body;
        const specailization = await Specialization.create({
            name,
            salon_id: salonId
        });
        res.status(201).json({
            specailization
        })

    } catch (err) {
        console.error("Error in adding specialization in salon:", err);
        next(err);
    }
}

export const getSpecialization = async (req, res, next) => {
    try {
        const salonId = req.params.salonId;
        const specializations = await Specialization.findAll({
            where: { salon_id: salonId } 
        });
        // console.log(specializations);
        res.status(200).json({ specializations });
    } catch (err) {
        console.error("Error in getting specialization in salon:", err);
        next(err);
    }
}