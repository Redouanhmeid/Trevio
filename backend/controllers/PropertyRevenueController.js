// controllers/PropertyRevenueController.js
const { PropertyRevenue, Property, Reservation } = require('../models');
const { Op } = require('sequelize');

const addRevenue = async (req, res) => {
 try {
  const {
   propertyId,
   reservationId,
   amount,
   startDate,
   endDate,
   notes,
   createdBy,
  } = req.body;

  // Check if revenue for this period already exists
  const existingRevenue = await PropertyRevenue.findOne({
   where: {
    propertyId,
    [Op.or]: [
     {
      startDate: { [Op.lte]: endDate },
      endDate: { [Op.gte]: startDate },
     },
    ],
   },
  });

  if (existingRevenue) {
   return res.status(400).json({
    error: 'Les revenus pour cette période existent déjà',
   });
  }

  const revenue = await PropertyRevenue.create({
   propertyId,
   reservationId,
   amount,
   startDate,
   endDate,
   notes,
   createdBy,
  });

  res.status(201).json(revenue);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: "Échec de l'ajout de revenus" });
 }
};

const updateRevenue = async (req, res) => {
 try {
  const { id } = req.params;
  const { amount, notes, startDate, endDate } = req.body;

  const revenue = await PropertyRevenue.findByPk(id);

  if (!revenue) {
   return res
    .status(404)
    .json({ error: 'Enregistrement des revenus non trouvé' });
  }

  // Check if another revenue for the updated period already exists
  const existingRevenue = await PropertyRevenue.findOne({
   where: {
    propertyId: revenue.propertyId,
    id: { [Op.ne]: id },
    [Op.or]: [
     {
      startDate: { [Op.lte]: endDate },
      endDate: { [Op.gte]: startDate },
     },
    ],
   },
  });

  if (existingRevenue) {
   return res
    .status(400)
    .json({ error: 'Les revenus pour cette période existent déjà' });
  }

  await revenue.update({ amount, notes, startDate, endDate });

  res.status(200).json(revenue);
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Échec de la mise à jour des revenus' });
 }
};

const getPropertyRevenue = async (req, res) => {
 try {
  const { propertyId } = req.params;
  const whereClause = { propertyId };

  const revenues = await PropertyRevenue.findAll({
   where: whereClause,
   order: [['startDate', 'DESC']],
   include: [
    {
     model: Property,
     as: 'property',
     attributes: ['name'],
    },
   ],
  });

  res.status(200).json(revenues);
 } catch (error) {
  console.error(error);
  res
   .status(500)
   .json({ error: 'Échec de la récupération des données sur les revenus' });
 }
};

const getAnnualRevenue = async (req, res) => {
 try {
  const { propertyId } = req.params;
  const { year } = req.params;

  // Calculate date range for the specified year
  const startOfYear = new Date(parseInt(year), 0, 1);
  const endOfYear = new Date(parseInt(year), 11, 31);

  const revenues = await PropertyRevenue.findAll({
   where: {
    propertyId,
    [Op.or]: [
     { startDate: { [Op.between]: [startOfYear, endOfYear] } },
     { endDate: { [Op.between]: [startOfYear, endOfYear] } },
     {
      [Op.and]: [
       { startDate: { [Op.lte]: startOfYear } },
       { endDate: { [Op.gte]: endOfYear } },
      ],
     },
    ],
   },
   order: [['startDate', 'ASC']],
   attributes: ['startDate', 'endDate', 'amount', 'notes'],
  });

  // Group revenues by month for the annual report
  const monthlyRevenues = Array(12)
   .fill(0)
   .map((_, i) => ({
    month: i + 1,
    amount: 0,
    notes: '',
   }));

  // Distribute revenue across months proportionally if it spans multiple months
  revenues.forEach((revenue) => {
   const start = new Date(Math.max(revenue.startDate, startOfYear));
   const end = new Date(Math.min(revenue.endDate, endOfYear));

   const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
   const amount = parseFloat(revenue.amount);

   // Create a map of days per month in this revenue period
   const monthDays = {};
   let currentDate = new Date(start);

   while (currentDate <= end) {
    const month = currentDate.getMonth();
    monthDays[month] = (monthDays[month] || 0) + 1;

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
   }

   // Distribute revenue proportionally based on days in each month
   Object.entries(monthDays).forEach(([month, days]) => {
    const monthIndex = parseInt(month);
    const proportion = days / totalDays;
    monthlyRevenues[monthIndex].amount += amount * proportion;

    // Add note if there's any
    if (revenue.notes) {
     if (monthlyRevenues[monthIndex].notes) {
      monthlyRevenues[monthIndex].notes += '; ';
     }
     monthlyRevenues[monthIndex].notes += revenue.notes;
    }
   });
  });

  // Calculate total revenue for the year
  const totalRevenue = monthlyRevenues.reduce(
   (sum, rev) => sum + Number(rev.amount),
   0
  );

  // Format amounts to 2 decimal places
  monthlyRevenues.forEach((rev) => {
   rev.amount = Math.round(rev.amount * 100) / 100;
  });

  res.status(200).json({
   revenues: monthlyRevenues,
   totalRevenue: Math.round(totalRevenue * 100) / 100,
  });
 } catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Échec de la récupération du revenu annuel' });
 }
};

const deleteRevenue = async (req, res) => {
 try {
  const { id } = req.params;

  const revenue = await PropertyRevenue.findByPk(id);

  if (!revenue) {
   return res
    .status(404)
    .json({ error: 'Enregistrement des revenus non trouvé' });
  }

  await revenue.destroy();

  res.status(200).json({
   message: "L'enregistrement des revenus a été supprimé avec succès",
  });
 } catch (error) {
  console.error(error);
  res
   .status(500)
   .json({ error: "Impossible de supprimer l'enregistrement des revenus" });
 }
};

// New function to create revenue from a contract
const createRevenueFromReservation = async (req, res) => {
 try {
  const { reservationId } = req.params;
  const { amount, notes, createdBy } = req.body;

  // Fetch the reservation to get propertyId and dates
  const reservation = await Reservation.findByPk(reservationId);

  if (!reservation) {
   return res.status(404).json({ error: 'Réservation non trouvée' });
  }

  // Check if revenue already exists for this reservation
  const existingRevenue = await PropertyRevenue.findOne({
   where: { reservationId },
  });

  if (existingRevenue) {
   return res.status(400).json({
    error: 'Un revenu existe déjà pour cette réservation',
   });
  }

  const revenue = await PropertyRevenue.create({
   propertyId: reservation.propertyId,
   reservationId,
   amount,
   startDate: reservation.startDate,
   endDate: reservation.endDate,
   notes,
   createdBy,
  });

  res.status(201).json(revenue);
 } catch (error) {
  console.error(error);
  res
   .status(500)
   .json({ error: "Échec de l'ajout de revenus depuis la réservation" });
 }
};

module.exports = {
 addRevenue,
 updateRevenue,
 getPropertyRevenue,
 getAnnualRevenue,
 deleteRevenue,
 createRevenueFromReservation,
};
