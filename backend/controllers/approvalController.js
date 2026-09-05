const ruleEngine = require('../services/ruleEngine');

async function evaluate(req, res) {
  try {
    const input = req.body || {};
    const userApplications = req.body.userApplications || [];
    const evaluation = ruleEngine.evaluateEligibilityAndDependencies(input, userApplications);
    return res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error('Error in evaluate approval:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to evaluate business profile approvals',
      error: error.message
    });
  }
}

async function getCatalog(req, res) {
  try {
    const state = req.query.state || 'Maharashtra';
    const district = req.query.district || 'Pune';
    const catalog = ruleEngine.getMasterApprovalCatalog(state, district);
    return res.json({
      success: true,
      data: catalog
    });
  } catch (error) {
    console.error('Error getting approval catalog:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve approval catalog',
      error: error.message
    });
  }
}

async function getDependencies(req, res) {
  try {
    const { state = 'Maharashtra', district = 'Pune', industry = 'Manufacturing' } = req.query;
    const evaluation = ruleEngine.evaluateEligibilityAndDependencies({ state, district, industry });
    return res.json({
      success: true,
      data: evaluation.dependencyGraph
    });
  } catch (error) {
    console.error('Error getting dependency graph:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate dependency graph',
      error: error.message
    });
  }
}

module.exports = {
  evaluate,
  getCatalog,
  getDependencies
};
