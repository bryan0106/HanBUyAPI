const sql = require('../utils/database');

const calculateShippingQuote = async (req, res) => {
  try {
    const { weight, cbm, origin, destination, box_type } = req.body;

    if (!weight || !cbm || !origin || !destination || !box_type) {
      return res.status(400).json({
        success: false,
        error: 'weight, cbm, origin, destination, and box_type are required'
      });
    }

    // Calculate ISF (International Service Fee) - Korea to Manila
    const isfBase = 200; // Base fee
    const isfWeight = weight * 50; // 50 PHP per kg
    const isf = isfBase + isfWeight;

    // Calculate LSF (Local Service Fee) - Manila to customer
    const lsfBase = 100; // Base fee
    const lsfCBM = cbm * 1000; // 1000 PHP per CBM
    const lsf = lsfBase + lsfCBM;

    // Adjust for box type
    let totalShipping = isf + lsf;
    if (box_type === 'solo') {
      totalShipping = totalShipping * 1.5; // Solo boxes cost more
    }

    res.json({
      success: true,
      data: {
        isf: Math.round(isf),
        lsf: Math.round(lsf),
        total_shipping: Math.round(totalShipping),
        currency: 'PHP',
        estimated_days: box_type === 'solo' ? 5 : 7
      }
    });
  } catch (error) {
    console.error('Error calculating shipping quote:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const calculateCBM = async (req, res) => {
  try {
    const { length, width, height, unit = 'cm' } = req.body;

    if (!length || !width || !height) {
      return res.status(400).json({
        success: false,
        error: 'length, width, and height are required'
      });
    }

    // Convert to meters if needed
    let lengthM = length;
    let widthM = width;
    let heightM = height;

    if (unit === 'cm') {
      lengthM = length / 100;
      widthM = width / 100;
      heightM = height / 100;
    }

    const cbm = lengthM * widthM * heightM;

    res.json({
      success: true,
      data: {
        cbm: parseFloat(cbm.toFixed(4)),
        length,
        width,
        height,
        unit
      }
    });
  } catch (error) {
    console.error('Error calculating CBM:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  calculateShippingQuote,
  calculateCBM
};


