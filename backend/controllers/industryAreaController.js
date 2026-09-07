const mongoose = require('mongoose');
const IndustryAreaEligibility = require('../models/IndustryAreaEligibility');
const { SEED_INDUSTRY_AREAS } = require('../data/seedIndustryAreas');

// Master list of supported states matching the frontend
const SUPPORTED_STATES = [
  "Maharashtra",
  "Karnataka",
  "Gujarat",
  "Tamil Nadu",
  "Telangana",
  "Andhra Pradesh",
  "Delhi",
  "Other States"
];

// In-memory fallback records for standalone tests and when MongoDB is offline
let memoryIndustryAreas = [...SEED_INDUSTRY_AREAS];

/**
 * Ensures seed verified regulatory records are present in MongoDB
 */
async function ensureIndustryAreaRecords() {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  try {
    for (const item of SEED_INDUSTRY_AREAS) {
      const exists = await IndustryAreaEligibility.findOne({
        state: item.state,
        district: item.district,
        industrialArea: item.industrialArea,
        category: item.category
      });

      if (!exists) {
        await IndustryAreaEligibility.create({
          state: item.state,
          district: item.district,
          industrialArea: item.industrialArea,
          category: item.category,
          industryType: item.industryType,
          eligibilityStatus: item.eligibilityStatus,
          conditions: item.conditions,
          authority: item.authority,
          sourceUrl: item.sourceUrl,
          sourceTitle: item.sourceTitle,
          lastVerifiedAt: item.lastVerifiedAt,
          coordinates: item.coordinates,
          isVerified: item.isVerified
        });
      }
    }
  } catch (err) {
    console.warn('[IndustryAreaController] Seed sync warning:', err.message);
  }
}

/**
 * GET /api/industry-areas/states
 * Returns all supported states with verified records count
 */
async function getStates(req, res) {
  try {
    let countsByState = {};

    if (mongoose.connection.readyState === 1) {
      const agg = await IndustryAreaEligibility.aggregate([
        { $match: { isVerified: true } },
        { $group: { _id: '$state', count: { $sum: 1 } } }
      ]);
      agg.forEach(item => {
        countsByState[item._id] = item.count;
      });
    } else {
      memoryIndustryAreas.filter(a => a.isVerified).forEach(item => {
        countsByState[item.state] = (countsByState[item.state] || 0) + 1;
      });
    }

    const states = SUPPORTED_STATES.map(name => ({
      name,
      verifiedCount: countsByState[name] || 0,
      hasVerifiedData: (countsByState[name] || 0) > 0
    }));

    return res.json({
      success: true,
      states
    });
  } catch (err) {
    console.error('[IndustryAreaController] getStates error:', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to load states information. Please try again.'
    });
  }
}

/**
 * GET /api/industry-areas?state={state}&district={district}&category={category}&industry={industry}
 * Filters verified records based on state, district, category, and industry type
 */
async function getAreas(req, res) {
  try {
    const { state, district, category, industry } = req.query;

    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'State parameter is required.'
      });
    }

    let results = [];

    if (mongoose.connection.readyState === 1) {
      const query = {
        isVerified: true,
        state: new RegExp(`^${state.trim()}$`, 'i')
      };

      if (district && district !== 'All' && district !== 'All Districts') {
        query.district = new RegExp(`^${district.trim()}$`, 'i');
      }

      if (category && category !== 'All' && category !== 'all') {
        query.category = category.toUpperCase().trim();
      }

      if (industry && industry !== 'All') {
        query.$or = [
          { industryType: { $in: [new RegExp(industry.trim(), 'i')] } },
          { industryType: { $size: 0 } } // General areas applicable to all industries
        ];
      }

      results = await IndustryAreaEligibility.find(query).sort({ district: 1, industrialArea: 1, category: 1 });
    } else {
      results = memoryIndustryAreas.filter(item => {
        if (!item.isVerified) return false;
        if (state && item.state.toLowerCase() !== state.toLowerCase()) return false;
        if (district && district !== 'All' && district !== 'All Districts' && item.district.toLowerCase() !== district.toLowerCase()) return false;
        if (category && category !== 'All' && category !== 'all' && item.category !== category.toUpperCase()) return false;
        if (industry && industry !== 'All') {
          const matches = item.industryType.some(ind => ind.toLowerCase().includes(industry.toLowerCase())) || item.industryType.length === 0;
          if (!matches) return false;
        }
        return true;
      });
    }

    return res.json({
      success: true,
      state,
      district: district || 'All',
      category: category || 'All',
      industry: industry || 'All',
      count: results.length,
      areas: results
    });
  } catch (err) {
    console.error('[IndustryAreaController] getAreas error:', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to load industry-area information. Please try again.'
    });
  }
}

/**
 * GET /api/industry-areas/search?industry={industry}&q={query}
 * Free-text and industry-driven search
 */
async function search(req, res) {
  try {
    const { industry, q, state } = req.query;
    let results = [];

    if (mongoose.connection.readyState === 1) {
      const query = { isVerified: true };

      if (state) {
        query.state = new RegExp(`^${state.trim()}$`, 'i');
      }

      const conditions = [];
      if (industry) {
        conditions.push({ industryType: { $in: [new RegExp(industry.trim(), 'i')] } });
      }
      if (q) {
        const regex = new RegExp(q.trim(), 'i');
        conditions.push({ industrialArea: regex });
        conditions.push({ district: regex });
        conditions.push({ conditions: regex });
        conditions.push({ authority: regex });
      }

      if (conditions.length > 0) {
        query.$or = conditions;
      }

      results = await IndustryAreaEligibility.find(query).limit(50);
    } else {
      results = memoryIndustryAreas.filter(item => {
        if (!item.isVerified) return false;
        if (state && item.state.toLowerCase() !== state.toLowerCase()) return false;
        if (industry) {
          const indMatches = item.industryType.some(ind => ind.toLowerCase().includes(industry.toLowerCase()));
          if (indMatches) return true;
        }
        if (q) {
          const term = q.toLowerCase();
          return item.industrialArea.toLowerCase().includes(term) ||
                 item.district.toLowerCase().includes(term) ||
                 item.conditions.toLowerCase().includes(term) ||
                 item.authority.toLowerCase().includes(term);
        }
        return true;
      });
    }

    return res.json({
      success: true,
      count: results.length,
      areas: results
    });
  } catch (err) {
    console.error('[IndustryAreaController] search error:', err);
    return res.status(500).json({
      success: false,
      message: 'Search failed. Please try again.'
    });
  }
}

/**
 * POST /api/industry-areas
 * Admin endpoint: Create a verified regulatory area record
 */
async function createArea(req, res) {
  try {
    const {
      state,
      district,
      industrialArea,
      category,
      industryType,
      eligibilityStatus,
      conditions,
      authority,
      sourceUrl,
      sourceTitle,
      lastVerifiedAt,
      coordinates
    } = req.body;

    // Rule 9: Reject incomplete records
    if (!state || !district || !industrialArea || !category || !conditions || !authority || !sourceTitle) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete record: state, district, industrialArea, category, conditions, authority, and official sourceTitle are mandatory.'
      });
    }

    if (!['RED', 'ORANGE', 'GREEN', 'WHITE'].includes(category.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pollution category. Must be RED, ORANGE, GREEN, or WHITE.'
      });
    }

    const newRecordData = {
      state: state.trim(),
      district: district.trim(),
      industrialArea: industrialArea.trim(),
      category: category.toUpperCase().trim(),
      industryType: Array.isArray(industryType) ? industryType : (industryType ? [industryType] : []),
      eligibilityStatus: eligibilityStatus || 'Allowed',
      conditions: conditions.trim(),
      authority: authority.trim(),
      sourceUrl: sourceUrl || '',
      sourceTitle: sourceTitle.trim(),
      lastVerifiedAt: lastVerifiedAt ? new Date(lastVerifiedAt) : new Date(),
      coordinates: coordinates || null,
      isVerified: true
    };

    let createdRecord;
    if (mongoose.connection.readyState === 1) {
      createdRecord = await IndustryAreaEligibility.create(newRecordData);
    } else {
      createdRecord = {
        _id: `ia-${Date.now()}`,
        ...newRecordData
      };
      memoryIndustryAreas.push(createdRecord);
    }

    return res.status(201).json({
      success: true,
      message: 'Verified industry area record created successfully.',
      area: createdRecord
    });
  } catch (err) {
    console.error('[IndustryAreaController] createArea error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create record: ' + err.message
    });
  }
}

/**
 * PUT /api/industry-areas/:id
 * Admin endpoint: Update existing area record or refresh verification date
 */
async function updateArea(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.category) {
      updates.category = updates.category.toUpperCase().trim();
    }
    if (updates.lastVerifiedAt) {
      updates.lastVerifiedAt = new Date(updates.lastVerifiedAt);
    }

    let updatedRecord;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      updatedRecord = await IndustryAreaEligibility.findByIdAndUpdate(id, updates, { new: true });
    } else {
      const idx = memoryIndustryAreas.findIndex(a => String(a._id) === String(id));
      if (idx !== -1) {
        memoryIndustryAreas[idx] = { ...memoryIndustryAreas[idx], ...updates };
        updatedRecord = memoryIndustryAreas[idx];
      }
    }

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Industry area record not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Industry area record updated successfully.',
      area: updatedRecord
    });
  } catch (err) {
    console.error('[IndustryAreaController] updateArea error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update record: ' + err.message
    });
  }
}

/**
 * DELETE /api/industry-areas/:id
 * Admin endpoint: Delete an outdated or invalid record
 */
async function deleteArea(req, res) {
  try {
    const { id } = req.params;

    let deleted = false;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const resDb = await IndustryAreaEligibility.findByIdAndDelete(id);
      deleted = Boolean(resDb);
    } else {
      const initLen = memoryIndustryAreas.length;
      memoryIndustryAreas = memoryIndustryAreas.filter(a => String(a._id) !== String(id));
      deleted = memoryIndustryAreas.length < initLen;
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Industry area record not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Industry area record deleted successfully.'
    });
  } catch (err) {
    console.error('[IndustryAreaController] deleteArea error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete record: ' + err.message
    });
  }
}

module.exports = {
  SUPPORTED_STATES,
  ensureIndustryAreaRecords,
  getStates,
  getAreas,
  search,
  createArea,
  updateArea,
  deleteArea
};
