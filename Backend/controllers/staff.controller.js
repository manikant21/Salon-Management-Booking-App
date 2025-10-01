// import Staff from "../models/staff.model.js";
// import Specialization from "../models/specialization.model.js";
import { cloneDeep } from "sequelize/lib/utils";
import { Staff, Specialization, Service } from "../models/index.model.js"

export const addStaff = async (req, res, next) => {
    try {
        const { name, email, phoneNo, salon_id, is_active } = req.body;
        if (!name || !email || !phoneNo || !salon_id) {
            return res.status(400).json({ message: "Fields are missing" });
        }

        const staff = await Staff.create({
            name,
            email,
            phoneNo,
            salon_id,
            is_active
        })

        res.status(200).json({ staff });

    } catch (error) {
        console.error("Error in adding staff in salon:", err);
        next(err);
    }
}


export const updateStaff = async (req, res, next) => {
    try {
        const { name, email, phoneNo, salon_id, is_active } = req.body;
        const staffId  = req.params.staffId;
        if (!name || !email || !phoneNo || !salon_id || !staffId) {
            return res.status(400).json({ message: "Fields are missing" });
        }

        const staff = await Staff.update({
            name,
            email,
            phoneNo,
            salon_id,
            is_active
        }, {
            where: {
                id: staffId
            }
        })
        res.status(200).json({ staff });
    } catch (error) {
        console.error("Error in updating staff in salon:", err);
        next(err);
    }
}

export const getStaffDetail = async (req, res, next) => {
    try {
        const salonId = req.params.salonId;
        const staff = await Staff.findAll({
            where: {
                salon_id: salonId
            },
             include: [
        {
          model: Specialization,
          through: { attributes: [] }
        }
      ]
        })
        // console.log(staff);
        // console.log("trying");
         res.status(200).json({ staff });

    } catch (err) {
         console.error("Error in fetching staffs from salon:", err);
        next(err);
    }
}

export const deleteStaff = async (req, res, next) => {
    try {
        const staffId = req.params.staffId
        const staff = await Staff.destroy({
            where: {
                id: staffId
            }
        })
        res.status(200).json({ msg: "Staff deleted successfully!" });
    } catch (err) {
        console.error("Error in deleting staffs from salon:", err);
        next(err);

    }
}

export const getStaffDetailForEdit = async (req, res, next) => {
    try {
        const staffId = req.params.staffId
        const staff = await Staff.findOne({
            where: {
                id: staffId
            }
        })
         res.status(200).json({ staff });
    } catch (error) {
        console.error("Error in getting staff detail from salon:", err);
        next(err);
    }
}


export const getStaffById = async (req, res, next) => {
    try {
        const { staffId } = req.params;
    const staff = await Staff.findByPk(staffId, {
      include: [{ model: Specialization, through: { attributes: [] } }]
    });
    
    // console.log(staff);
    // console.log("Hi")

    res.json({ staff });

    } catch (err) {
        console.error("Error in getting staff detail from salon:", err);
        next(err);
    }
}

export const assignSpecializations = async (req, res, next) => {
    try {
        const { staffId, specializationIds } = req.body;

    const staff = await Staff.findByPk(staffId);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    await staff.setSpecializations(specializationIds); // Sequelize magic
    // console.log("its created !!!")
    res.json({ message: "Specializations updated successfully" });
    } catch (err) {
        console.error("Error in assigning specialization to staff in salon:", err);
        next(err);
    }
};

export const getStaffByService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    // 1. Find service
    const service = await Service.findByPk(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // 2. Find all specializations of this salon
    const specializations = await Specialization.findAll({
      where: { salon_id: service.salon_id },
      include: [
        {
          model: Staff,
          through: { attributes: [] },
          where: { is_active: true },
          required: false
        }
      ]
    });

    // 3. Collect unique staff
    const staffList = [];
    const staffMap = new Map();

    specializations.forEach(spec => {
      spec.Staffs.forEach(staff => {
        if (!staffMap.has(staff.id)) {
          staffMap.set(staff.id, staff);
          staffList.push(staff);
        }
      });
    });
    // console.log(staffList);
    // console.log("bye");

    res.json(staffList);
  } catch (err) {
    // res.status(500).json({ error: err.message });
      console.error("Error in assigning specialization to staff in salon:", err);
    next(err);
  }
};


